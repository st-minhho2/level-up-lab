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

// The whole URL comes first so it is replaced as one piece; the password alone would leave the rest of the URL behind.
// An unreadable environment or URL means no redaction (REQ-11.6), and an empty password is skipped because
// replaceAll('') would insert the marker between every character.
function secretsOf(): string[] {
  try {
    const url = getEnv().DATABASE_URL;
    return [url, new URL(url).password].filter((secret) => secret !== '');
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
  const { code } = error as Error & { readonly code?: unknown };
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
