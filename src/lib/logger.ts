// §11 logging failures: one JSON line on stderr per swallowed mutation failure, secrets redacted, never `console`.
// No `server-only` and no Prisma import; configuration is read only through getEnv() (§4).
import { getEnv } from '@/lib/env';

export type MutationActionName =
  'createTodoAction' | 'toggleTodoAction' | 'updateTodoTitleAction' | 'clearCompletedTodosAction';

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

// A form that cannot be percent-decoded is left out on its own, so the other forms of every secret still count.
function decoded(text: string): string[] {
  try {
    return [decodeURIComponent(text)];
  } catch {
    return [];
  }
}

// The value of each `name=value` pair named in SECRET_QUERY_PARAMETERS, as written and decoded; URLSearchParams is not
// used because it reads `+` as a space and decodes leniently, which would miss the forms the driver may echo.
function querySecretsOf(search: string): string[] {
  return search
    .slice(1)
    .split('&')
    .flatMap((pair) =>
      SECRET_QUERY_PARAMETERS.filter((name) => pair.startsWith(`${name}=`)).flatMap((name) => {
        const raw = pair.slice(name.length + 1);
        return [raw, ...decoded(raw)];
      }),
    );
}

// Longest first, so a secret that contains a shorter one is replaced whole; the whole URL is the longest of all, so
// the password alone never leaves the rest of the URL behind. An unreadable environment or URL means no redaction
// (REQ-11.6), and an empty string is skipped because replaceAll('') would insert the marker between every character.
function secretsOf(): string[] {
  try {
    const value = getEnv().DATABASE_URL;
    const url = new URL(value);
    const passwordForms = decoded(url.password).flatMap((plain) => [plain, encodeURIComponent(plain)]);
    return [value, url.password, ...passwordForms, ...querySecretsOf(url.search)]
      .filter((secret) => secret !== '')
      .sort((a, b) => b.length - a.length);
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
