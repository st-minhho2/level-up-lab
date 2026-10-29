import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { logMutationFailure } from './logger';

const env = vi.hoisted(() => ({ getEnv: vi.fn() }));

vi.mock('@/lib/env', () => ({ getEnv: env.getEnv }));

const DATABASE_URL = 'postgresql://app:s3cret@db.internal:5432/lab';
const FIXED_TIME = '2026-01-02T03:04:05.678Z';

interface LoggedError {
  name: string;
  message: string;
  code?: string;
  stack?: string;
}

interface LoggedEntry {
  level: string;
  time: string;
  msg: string;
  action: string;
  error: LoggedError;
}

let stderr: MockInstance<typeof process.stderr.write>;
let stdout: MockInstance<typeof process.stdout.write>;

function textOf(chunk: unknown): string {
  if (typeof chunk !== 'string') {
    throw new TypeError(`expected a string chunk, got ${typeof chunk}`);
  }
  return chunk;
}

// The one chunk written to stderr, checked for count, then parsed without its trailing newline.
function onlyEntry(): LoggedEntry {
  expect(stderr).toHaveBeenCalledTimes(1);
  const chunk = textOf(stderr.mock.calls[0]?.[0]);
  return JSON.parse(chunk.slice(0, -1)) as LoggedEntry;
}

function codedError(message: string, code: unknown): Error {
  return Object.assign(new Error(message), { code });
}

// Prisma's initialization errors carry their code as `errorCode`; `code` is set only when given, so "no code" means no key.
function errorCodedError(message: string, errorCode: unknown, code?: unknown): Error {
  return Object.assign(new Error(message), code === undefined ? { errorCode } : { errorCode, code });
}

beforeEach(() => {
  vi.resetAllMocks();
  env.getEnv.mockReturnValue({ DATABASE_URL });
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_TIME));
  stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
  stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
});

afterEach(() => {
  stderr.mockRestore();
  stdout.mockRestore();
  vi.useRealTimers();
});

describe('logMutationFailure (§11)', () => {
  it('AC-11.1: writes one newline-terminated JSON line with level, time, msg, action and error to stderr and nothing to stdout', () => {
    const error = new Error('db down');
    let result: unknown = 'not called';

    result = logMutationFailure('toggleTodoAction', error);

    expect(result).toBeUndefined();
    expect(stdout).toHaveBeenCalledTimes(0);
    expect(stderr).toHaveBeenCalledTimes(1);
    const chunk = stderr.mock.calls[0]?.[0];
    expect(typeof chunk).toBe('string');
    const line = textOf(chunk);
    expect(line.split('\n')).toHaveLength(2);
    expect(line.endsWith('\n')).toBe(true);
    const entry = JSON.parse(line.slice(0, -1)) as LoggedEntry;
    expect(Object.keys(entry)).toEqual(['level', 'time', 'msg', 'action', 'error']);
    expect(entry.level).toBe('error');
    expect(entry.time).toBe(FIXED_TIME);
    expect(entry.msg).toBe('mutation failed');
    expect(entry.action).toBe('toggleTodoAction');
    expect(Object.keys(entry.error)).toEqual(['name', 'message', 'stack']);
    expect(entry.error.name).toBe('Error');
    expect(entry.error.message).toBe('db down');
    expect(entry.error.stack?.startsWith('Error: db down')).toBe(true);
  });

  it('AC-11.2: records a string code as error.code, between message and stack', () => {
    const error = codedError('db down', 'P1001');

    logMutationFailure('clearCompletedTodosAction', error);

    const entry = onlyEntry();
    expect(Object.keys(entry.error)).toEqual(['name', 'message', 'code', 'stack']);
    expect(entry.error.code).toBe('P1001');
  });

  it('AC-11.2: records no code key when the code is a number', () => {
    const error = codedError('db down', 42);

    logMutationFailure('clearCompletedTodosAction', error);

    const entry = onlyEntry();
    expect(Object.keys(entry.error)).not.toContain('code');
    expect(entry.error.message).toBe('db down');
  });

  it('AC-11.2: records a thrown string as { name: "NonError", message } with no stack and no code', () => {
    const value = 'boom';

    logMutationFailure('clearCompletedTodosAction', value);

    const entry = onlyEntry();
    expect(entry.error).toEqual({ name: 'NonError', message: 'boom' });
    expect(Object.keys(entry.error)).toEqual(['name', 'message']);
  });

  it('AC-11.2: records a string errorCode as error.code when the Error has no string code', () => {
    const error = errorCodedError('db down', 'P1001');

    logMutationFailure('clearCompletedTodosAction', error);

    const entry = onlyEntry();
    expect(Object.keys(entry.error)).toEqual(['name', 'message', 'code', 'stack']);
    expect(entry.error.code).toBe('P1001');
    expect(Object.keys(entry.error)).not.toContain('errorCode');
  });

  it('AC-11.2: records the string errorCode as error.code when the code is a number', () => {
    const error = errorCodedError('db down', 'P1001', 42);

    logMutationFailure('clearCompletedTodosAction', error);

    const entry = onlyEntry();
    expect(entry.error.code).toBe('P1001');
    expect(Object.keys(entry.error)).not.toContain('errorCode');
  });

  it('AC-11.2: records the string code, not the errorCode, when the Error carries both', () => {
    const error = errorCodedError('db down', 'P1001', 'P2002');

    logMutationFailure('clearCompletedTodosAction', error);

    const entry = onlyEntry();
    expect(entry.error.code).toBe('P2002');
    expect(Object.keys(entry.error)).not.toContain('errorCode');
  });

  it('AC-11.2: records no code key when the errorCode is a number and there is no code', () => {
    const error = errorCodedError('db down', 1001);

    logMutationFailure('clearCompletedTodosAction', error);

    const entry = onlyEntry();
    expect(Object.keys(entry.error)).not.toContain('code');
    expect(Object.keys(entry.error)).not.toContain('errorCode');
    expect(entry.error.message).toBe('db down');
  });

  it('AC-11.3: replaces the DATABASE_URL value and its password with [redacted] in message and stack', () => {
    const error = new Error(`Can't reach ${DATABASE_URL} (password s3cret)`);

    logMutationFailure('createTodoAction', error);

    const chunk = textOf(stderr.mock.calls[0]?.[0]);
    expect(chunk).not.toContain(DATABASE_URL);
    expect(chunk).not.toContain('s3cret');
    expect(onlyEntry().error.message).toBe("Can't reach [redacted] (password [redacted])");
  });

  it('AC-11.3: cuts message to 500 characters and stack to 2000', () => {
    const error = new Error('x'.repeat(600));
    error.stack = `Error: ${'y'.repeat(3000)}`;

    logMutationFailure('createTodoAction', error);

    const entry = onlyEntry();
    expect(entry.error.message).toHaveLength(500);
    expect(entry.error.stack).toHaveLength(2000);
  });

  it('AC-11.4: returns undefined and does not throw when the write to stderr throws', () => {
    stderr.mockImplementation(() => {
      throw new Error('EPIPE');
    });
    let result: unknown = 'not called';
    const outcome = (): void => {
      result = logMutationFailure('toggleTodoAction', new Error('db down'));
    };

    expect(outcome).not.toThrow();

    expect(result).toBeUndefined();
    expect(stderr).toHaveBeenCalledTimes(1);
  });

  it('AC-11.4: returns undefined, does not throw and still writes the entry when getEnv throws', () => {
    env.getEnv.mockImplementation(() => {
      throw new Error('Invalid environment');
    });
    let result: unknown = 'not called';
    const outcome = (): void => {
      result = logMutationFailure('toggleTodoAction', new Error('db down'));
    };

    expect(outcome).not.toThrow();

    expect(result).toBeUndefined();
    expect(onlyEntry().error.message).toBe('db down');
  });

  it("records the thrown Error's own name (REQ-11.3)", () => {
    const error = new TypeError('db down');

    logMutationFailure('toggleTodoAction', error);

    const entry = onlyEntry();
    expect(entry.error.name).toBe('TypeError');
    expect(entry.error.message).toBe('db down');
  });

  it('omits stack when the Error has none', () => {
    const error = new Error('db down');
    error.stack = undefined;

    logMutationFailure('toggleTodoAction', error);

    const entry = onlyEntry();
    expect(entry.error).toEqual({ name: 'Error', message: 'db down' });
    expect(Object.keys(entry.error)).toEqual(['name', 'message']);
  });

  it('redacts before cutting, so a URL that straddles the cut leaves no fragment (REQ-11.4)', () => {
    const error = new Error(`${'x'.repeat(490)}${DATABASE_URL}`);

    logMutationFailure('createTodoAction', error);

    expect(onlyEntry().error.message).toBe(`${'x'.repeat(490)}[redacted]`);
  });

  it('redacts and cuts the text of a thrown non-Error value too (REQ-11.4)', () => {
    const value = `${DATABASE_URL}${'z'.repeat(600)}`;

    logMutationFailure('createTodoAction', value);

    expect(onlyEntry().error).toEqual({ name: 'NonError', message: `[redacted]${'z'.repeat(490)}` });
  });

  it('redacts only the URL when DATABASE_URL has no password', () => {
    const passwordless = 'postgresql://app@db.internal:5432/lab';
    env.getEnv.mockReturnValue({ DATABASE_URL: passwordless });
    const error = new Error(`Can't reach ${passwordless}: db down`);

    logMutationFailure('createTodoAction', error);

    expect(onlyEntry().error.message).toBe("Can't reach [redacted]: db down");
  });

  it('redacts every occurrence of the password', () => {
    const error = new Error('s3cret and s3cret');

    logMutationFailure('createTodoAction', error);

    expect(onlyEntry().error.message).toBe('[redacted] and [redacted]');
  });

  it('AC-11.3: leaves the message unchanged when the password and sslpassword query values are empty', () => {
    env.getEnv.mockReturnValue({ DATABASE_URL: 'postgresql://app@db.internal:5432/lab?password=&sslpassword=' });
    const error = new Error('db down');

    logMutationFailure('createTodoAction', error);

    expect(onlyEntry().error.message).toBe('db down');
  });

  it('leaves the values of query parameters not named exactly password or sslpassword unredacted (REQ-11.4)', () => {
    env.getEnv.mockReturnValue({
      DATABASE_URL: 'postgresql://app@db.internal:5432/lab?schema=public&PASSWORD=upper&password',
    });
    const error = new Error('The table public.todos does not exist; upper');

    logMutationFailure('createTodoAction', error);

    expect(onlyEntry().error.message).toBe('The table public.todos does not exist; upper');
  });
});
