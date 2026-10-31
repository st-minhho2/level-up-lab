// §11 logging failures: one JSON line on stderr per swallowed mutation failure, secrets redacted, never `console`.
// No `server-only` and no Prisma import; configuration is read only through getEnv() (§4).
import { getEnv } from '@/lib/env';

export type MutationActionName =
  | 'createTodoAction'
  | 'toggleTodoAction'
  | 'updateTodoTitleAction'
  | 'clearCompletedTodosAction'
  | 'completeAllTodosAction';

const LOG_MESSAGE_MAX_LENGTH = 500;
const LOG_STACK_MAX_LENGTH = 2000;
const REDACTED = '[redacted]';

interface LoggedError {
  readonly name: string;
  readonly message: string;
  readonly code?: string;
  readonly stack?: string;
}

// Query parameters whose value is a secret (REQ-11.4); the name must match exactly, in this case.
const SECRET_QUERY_PARAMETERS: readonly string[] = ['password', 'sslpassword'];

// The text after the first `://`, up to the first `/`, `?` or `#`: the authority as written, which the parser may have
// re-escaped (REQ-11.4).
const WRITTEN_AUTHORITY = /:\/\/([^/?#]*)/;

// A source as written, decoded, and decoded then re-encoded; when it cannot be percent-decoded only the written form
// is left, so the other forms of every other secret still count.
function formsOf(source: string): string[] {
  try {
    const plain = decodeURIComponent(source);
    return [source, plain, encodeURIComponent(plain)];
  } catch {
    return [source];
  }
}

// The written userinfo is the authority before its last `@` and the password is after its first `:`, as the parser
// splits them; no `@` or no `:` means no written password, so a user name or a port never becomes a secret.
function writtenPasswordOf(value: string): string[] {
  const authority = WRITTEN_AUTHORITY.exec(value)?.[1] ?? '';
  const at = authority.lastIndexOf('@');
  const userinfo = authority.slice(0, at);
  const colon = userinfo.indexOf(':');
  return at === -1 || colon === -1 ? [] : [userinfo.slice(colon + 1)];
}

// The value of each `&`-separated pair named exactly in SECRET_QUERY_PARAMETERS; URLSearchParams is not used because
// it reads `+` as a space and decodes leniently, which would miss the forms the driver may echo.
function queryPasswordsOf(query: string): string[] {
  return query
    .split('&')
    .flatMap((pair) =>
      SECRET_QUERY_PARAMETERS.filter((name) => pair.startsWith(`${name}=`)).map((name) => pair.slice(name.length + 1)),
    );
}

// The written query is the value up to its first `#`, then after its first `?`; a fragment is never a secret.
function writtenQueryOf(value: string): string[] {
  const hash = value.indexOf('#');
  const beforeFragment = hash === -1 ? value : value.slice(0, hash);
  const question = beforeFragment.indexOf('?');
  return question === -1 ? [] : queryPasswordsOf(beforeFragment.slice(question + 1));
}

// Longest first, so a secret that contains a shorter one is replaced whole; the whole URL is the longest of all, so
// the password alone never leaves the rest of the URL behind. An unreadable environment or URL means no redaction
// (REQ-11.6), and an empty string is skipped because replaceAll('') would insert the marker between every character.
function secretsOf(): string[] {
  try {
    const value = getEnv().DATABASE_URL;
    const url = new URL(value);
    const sources = [
      url.password,
      ...writtenPasswordOf(value),
      ...queryPasswordsOf(url.search.slice(1)),
      ...writtenQueryOf(value),
    ];
    return [value, ...sources.flatMap(formsOf)].filter((secret) => secret !== '').sort((a, b) => b.length - a.length);
  } catch {
    return [];
  }
}

// Redact before cutting (REQ-11.4), so a secret that straddles the limit leaves no fragment.
function scrub(text: string, secrets: readonly string[], maxLength: number): string {
  let scrubbed = text;
  for (const secret of secrets) {
    scrubbed = scrubbed.replaceAll(secret, REDACTED);
  }
  return scrubbed.slice(0, maxLength);
}

function describeError(error: unknown, secrets: readonly string[]): LoggedError {
  if (!(error instanceof Error)) {
    return { name: 'NonError', message: scrub(String(error), secrets, LOG_MESSAGE_MAX_LENGTH) };
  }
  // Prisma's initialization errors (a failed connection) carry their code as `errorCode`, not `code`; a string `code`
  // still wins, and the property name is never written, only its value as `code`.
  const { code: ownCode, errorCode } = error as Error & { readonly code?: unknown; readonly errorCode?: unknown };
  const code = typeof ownCode === 'string' ? ownCode : errorCode;
  return {
    name: error.name,
    message: scrub(error.message, secrets, LOG_MESSAGE_MAX_LENGTH),
    ...(typeof code === 'string' ? { code } : {}),
    ...(typeof error.stack === 'string' ? { stack: scrub(error.stack, secrets, LOG_STACK_MAX_LENGTH) } : {}),
  };
}

export function logMutationFailure(action: MutationActionName, error: unknown): void {
  try {
    const entry = {
      level: 'error',
      time: new Date().toISOString(),
      msg: 'mutation failed',
      action,
      error: describeError(error, secretsOf()),
    };
    process.stderr.write(`${JSON.stringify(entry)}\n`);
  } catch {
    // REQ-11.6: a logging failure never changes the §10 result the person sees.
  }
}
