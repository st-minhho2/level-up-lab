import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MutationActionName } from '@/lib/logger';
import { TodoNotFoundError } from '@/lib/todos';
import { deleteTodoAction } from './delete-todo';

const lib = vi.hoisted(() => ({ deleteTodo: vi.fn<(id: string) => Promise<void>>() }));
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const logger = vi.hoisted(() => ({
  logMutationFailure: vi.fn<(action: MutationActionName, error: unknown) => void>(),
}));

vi.mock('@/lib/todo-delete', () => ({ deleteTodo: lib.deleteTodo }));
vi.mock('next/cache', () => ({ revalidatePath: cache.revalidatePath }));
// §11: observed at the module boundary; also keeps the swallowed-failure tests from writing to stderr.
vi.mock('@/lib/logger', () => ({ logMutationFailure: logger.logMutationFailure }));
// TodoNotFoundError is the real class of '@/lib/todos', whose Prisma import pulls `server-only` (throws under Vitest).
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

// §10: the failure result every mutating action reports on `form`.
function formFailure(): { ok: false; fieldErrors: { form: string[] } } {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

// §11: exactly one call, with exactly the action's own name and the thrown value (same reference).
function expectLoggedOnce(error: unknown): void {
  expect(logger.logMutationFailure).toHaveBeenCalledTimes(1);
  const args = logger.logMutationFailure.mock.calls[0];
  expect(args).toHaveLength(2);
  expect(args?.[0]).toBe('deleteTodoAction');
  expect(args?.[1]).toBe(error);
}

// Records the log entry and the promise settling in the order they happen ("before the promise resolves").
function recordOrder(outcome: Promise<unknown>, events: string[]): Promise<unknown> {
  logger.logMutationFailure.mockImplementation(() => {
    events.push('logged');
  });
  return outcome.then((value) => {
    events.push('resolved');
    return value;
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('deleteTodoAction (§19)', () => {
  it('AC-19.2: resolves { ok: true, data: { id: "todo-1" } }, calls deleteTodo once with exactly ("todo-1") and revalidates / once', async () => {
    lib.deleteTodo.mockResolvedValue(undefined);

    const result = await deleteTodoAction('todo-1');

    expect(result).toEqual({ ok: true, data: { id: 'todo-1' } });
    expect(lib.deleteTodo).toHaveBeenCalledTimes(1);
    expect(lib.deleteTodo.mock.calls[0]).toEqual(['todo-1']);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath.mock.calls[0]).toEqual(['/']);
  });

  it('AC-19.3: resolves fieldErrors.id ["Todo id is required"] for "" without calling deleteTodo, then fieldErrors.id ["Todo not found"] for an unknown id, revalidating 0 times and logging 0 times', async () => {
    lib.deleteTodo.mockRejectedValue(new TodoNotFoundError('todo-1'));

    const empty = await deleteTodoAction('');
    const callsAfterEmpty = lib.deleteTodo.mock.calls.length;
    const missing = await deleteTodoAction('todo-1');

    expect(empty).toEqual({ ok: false, fieldErrors: { id: ['Todo id is required'] } });
    expect(callsAfterEmpty).toBe(0);
    expect(missing).toEqual({ ok: false, fieldErrors: { id: ['Todo not found'] } });
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
    expect(logger.logMutationFailure).toHaveBeenCalledTimes(0);
  });

  it('AC-19.4: (a) resolves exactly the form failure "Could not save, try again" when deleteTodo rejects, revalidates 0 times and logs ("deleteTodoAction", that Error) once before resolving', async () => {
    const error = new Error('db down');
    const events: string[] = [];
    lib.deleteTodo.mockRejectedValue(error);

    const outcome = recordOrder(deleteTodoAction('todo-1'), events);

    await expect(outcome).resolves.toEqual(formFailure());
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
    expect(lib.deleteTodo).toHaveBeenCalledTimes(1);
    expect(lib.deleteTodo.mock.calls[0]).toEqual(['todo-1']);
    expectLoggedOnce(error);
    expect(events).toEqual(['logged', 'resolved']);
  });

  it('AC-19.4: (b) resolves exactly the form failure "Could not save, try again" when revalidatePath throws, and logs ("deleteTodoAction", that Error) once before resolving', async () => {
    const error = new Error('cache down');
    const events: string[] = [];
    lib.deleteTodo.mockResolvedValue(undefined);
    cache.revalidatePath.mockImplementation(() => {
      throw error;
    });

    const outcome = recordOrder(deleteTodoAction('todo-1'), events);

    await expect(outcome).resolves.toEqual(formFailure());
    expect(lib.deleteTodo).toHaveBeenCalledTimes(1);
    expect(lib.deleteTodo.mock.calls[0]).toEqual(['todo-1']);
    expectLoggedOnce(error);
    expect(events).toEqual(['logged', 'resolved']);
  });
});
