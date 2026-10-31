import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MutationActionName } from '@/lib/logger';
import { completeAllTodosAction } from './complete-all';

const lib = vi.hoisted(() => ({ completeAllTodos: vi.fn<() => Promise<number>>() }));
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const logger = vi.hoisted(() => ({
  logMutationFailure: vi.fn<(action: MutationActionName, error: unknown) => void>(),
}));

vi.mock('@/lib/todo-complete-all', () => ({ completeAllTodos: lib.completeAllTodos }));
vi.mock('next/cache', () => ({ revalidatePath: cache.revalidatePath }));
// §11: observed at the module boundary; also keeps the swallowed-failure tests from writing to stderr.
vi.mock('@/lib/logger', () => ({ logMutationFailure: logger.logMutationFailure }));

// §10: the failure result every mutating action reports on `form`.
function formFailure(): { ok: false; fieldErrors: { form: string[] } } {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

// §11: exactly one call, with exactly the action's own name and the thrown value (same reference).
function expectLoggedOnce(error: unknown): void {
  expect(logger.logMutationFailure).toHaveBeenCalledTimes(1);
  const args = logger.logMutationFailure.mock.calls[0];
  expect(args).toHaveLength(2);
  expect(args?.[0]).toBe('completeAllTodosAction');
  expect(args?.[1]).toBe(error);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('completeAllTodosAction (§14)', () => {
  it('AC-14.2: resolves { ok: true, data: { updated: 2 } }, calls completeAllTodos once with 0 arguments and revalidates / once', async () => {
    lib.completeAllTodos.mockResolvedValue(2);

    const result = await completeAllTodosAction();

    expect(result).toEqual({ ok: true, data: { updated: 2 } });
    expect(lib.completeAllTodos).toHaveBeenCalledTimes(1);
    expect(lib.completeAllTodos.mock.calls[0]).toEqual([]);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath.mock.calls[0]).toEqual(['/']);
  });

  it('AC-14.3: resolves exactly the form failure "Could not save, try again", revalidates nothing and logs ("completeAllTodosAction", the thrown error) once before resolving', async () => {
    const error = new Error('db down');
    const events: string[] = [];
    lib.completeAllTodos.mockRejectedValue(error);
    logger.logMutationFailure.mockImplementation(() => {
      events.push('logged');
    });

    const outcome = completeAllTodosAction().then((value) => {
      events.push('resolved');
      return value;
    });

    await expect(outcome).resolves.toEqual(formFailure());
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
    expect(lib.completeAllTodos).toHaveBeenCalledTimes(1);
    expectLoggedOnce(error);
    expect(events).toEqual(['logged', 'resolved']);
  });

  it('resolves the form failure and logs ("completeAllTodosAction", the thrown error) once when revalidatePath throws (REQ-14.8)', async () => {
    const error = new Error('cache down');
    lib.completeAllTodos.mockResolvedValue(2);
    cache.revalidatePath.mockImplementation(() => {
      throw error;
    });

    const outcome = completeAllTodosAction();

    await expect(outcome).resolves.toEqual(formFailure());
    expect(JSON.stringify(await outcome)).not.toContain('cache down');
    expect(lib.completeAllTodos).toHaveBeenCalledTimes(1);
    expectLoggedOnce(error);
  });
});
