import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MutationActionName } from '@/lib/logger';
import { TodoNotFoundError } from '@/lib/todos';
import { clearCompletedTodosAction, createTodoAction, toggleTodoAction, updateTodoTitleAction } from './todos';

const lib = vi.hoisted(() => ({
  createTodo: vi.fn(),
  toggleTodo: vi.fn(),
  updateTodoTitle: vi.fn(),
  clearCompletedTodos: vi.fn(),
}));
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
const logger = vi.hoisted(() => ({
  logMutationFailure: vi.fn<(action: MutationActionName, error: unknown) => void>(),
}));

vi.mock('@/lib/todos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/todos')>()),
  createTodo: lib.createTodo,
  toggleTodo: lib.toggleTodo,
  updateTodoTitle: lib.updateTodoTitle,
  clearCompletedTodos: lib.clearCompletedTodos,
}));
vi.mock('next/cache', () => ({ revalidatePath: cache.revalidatePath }));
// §11: observed at the module boundary; also keeps the swallowed-failure tests from writing to stderr.
vi.mock('@/lib/logger', () => ({ logMutationFailure: logger.logMutationFailure }));
// importOriginal above loads the real lib module, whose Prisma import pulls `server-only` (throws under Vitest).
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

function todo(overrides: Partial<{ id: string; title: string; completed: boolean }> = {}) {
  return { id: 'todo-1', title: 'Buy milk', completed: false, createdAt: new Date(2026, 0, 1), ...overrides };
}

function form(title: string): FormData {
  const data = new FormData();
  data.set('title', title);
  return data;
}

function formFailure() {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

// §11: exactly one call, with exactly the action's own name and the thrown value (same reference), never the input.
function expectLoggedOnce(action: MutationActionName, error: unknown): void {
  expect(logger.logMutationFailure).toHaveBeenCalledTimes(1);
  const args = logger.logMutationFailure.mock.calls[0];
  expect(args).toHaveLength(2);
  expect(args?.[0]).toBe(action);
  expect(args?.[1]).toBe(error);
  expect(JSON.stringify(args)).not.toContain('Buy milk');
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('createTodoAction', () => {
  it('AC-5.2: creates the trimmed title as a not-completed todo and revalidates / once', async () => {
    lib.createTodo.mockResolvedValue(todo());

    const result = await createTodoAction(null, form('  Buy milk  '));

    expect(result).toMatchObject({ ok: true, data: { title: 'Buy milk', completed: false } });
    expect(lib.createTodo).toHaveBeenCalledWith('Buy milk');
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('AC-5.3: returns fieldErrors.title ["Title is required"] for a blank title and stores nothing', async () => {
    const result = await createTodoAction(null, form('   '));

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title is required'] } });
    expect(lib.createTodo).not.toHaveBeenCalled();
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('AC-5.3: returns fieldErrors.title ["Title is required"] when the form has no title field and stores nothing', async () => {
    const result = await createTodoAction(null, new FormData());

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title is required'] } });
    expect(lib.createTodo).toHaveBeenCalledTimes(0);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
  });

  it('AC-5.3: returns fieldErrors.title ["Title must be 200 characters or fewer"] for 201 characters', async () => {
    const result = await createTodoAction(null, form('x'.repeat(201)));

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title must be 200 characters or fewer'] } });
    expect(lib.createTodo).not.toHaveBeenCalled();
  });

  it('AC-10.4: resolves fieldErrors.form ["Could not save, try again"] when createTodo rejects and does not revalidate', async () => {
    lib.createTodo.mockRejectedValue(new Error('db down'));

    await expect(createTodoAction(null, form('Buy milk'))).resolves.toEqual({
      ok: false,
      fieldErrors: { form: ['Could not save, try again'] },
    });

    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
    expect(lib.createTodo).toHaveBeenCalledTimes(1);
    expect(lib.createTodo).toHaveBeenCalledWith('Buy milk');

    await expect(createTodoAction(null, form('   '))).resolves.toEqual({
      ok: false,
      fieldErrors: { title: ['Title is required'] },
    });

    expect(lib.createTodo).toHaveBeenCalledTimes(1);
  });

  it('createTodoAction resolves the form failure when revalidatePath throws after createTodo resolves', async () => {
    lib.createTodo.mockResolvedValue(todo());
    cache.revalidatePath.mockImplementation(() => {
      throw new Error('cache down');
    });

    const outcome = createTodoAction(null, form('Buy milk'));

    await expect(outcome).resolves.toEqual({ ok: false, fieldErrors: { form: ['Could not save, try again'] } });
    expect(lib.createTodo).toHaveBeenCalledTimes(1);
  });
});

describe('toggleTodoAction', () => {
  it('AC-5.4: returns the toggled todo and revalidates /', async () => {
    lib.toggleTodo.mockResolvedValueOnce(todo({ completed: true })).mockResolvedValueOnce(todo({ completed: false }));

    const first = await toggleTodoAction('todo-1');
    const second = await toggleTodoAction('todo-1');

    expect(first).toMatchObject({ ok: true, data: { id: 'todo-1', completed: true } });
    expect(second).toMatchObject({ ok: true, data: { id: 'todo-1', completed: false } });
    expect(lib.toggleTodo).toHaveBeenCalledTimes(2);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(2);
    expect(cache.revalidatePath.mock.calls).toEqual([['/'], ['/']]);
  });

  it('AC-5.5: returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate', async () => {
    lib.toggleTodo.mockRejectedValue(new TodoNotFoundError('missing'));

    const result = await toggleTodoAction('missing');

    expect(result).toEqual({ ok: false, fieldErrors: { id: ['Todo not found'] } });
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('AC-10.1: resolves fieldErrors.form ["Could not save, try again"] when the lib rejects with another error and does not revalidate', async () => {
    lib.toggleTodo.mockRejectedValue(new Error('db down'));

    await expect(toggleTodoAction('todo-1')).resolves.toEqual({
      ok: false,
      fieldErrors: { form: ['Could not save, try again'] },
    });

    expect(lib.toggleTodo).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
  });
});

describe('updateTodoTitleAction (§6)', () => {
  it('AC-6.2: updates the trimmed title and revalidates / once', async () => {
    lib.updateTodoTitle.mockResolvedValue(todo({ title: 'Buy milk' }));

    const result = await updateTodoTitleAction('todo-1', '  Buy milk  ');

    expect(result).toEqual({ ok: true, data: todo({ title: 'Buy milk' }) });
    expect(lib.updateTodoTitle).toHaveBeenCalledTimes(1);
    expect(lib.updateTodoTitle).toHaveBeenCalledWith('todo-1', 'Buy milk');
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('AC-6.4: returns fieldErrors.title for a blank title', async () => {
    const result = await updateTodoTitleAction('todo-1', '   ');

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title is required'] } });
    expect(lib.updateTodoTitle).not.toHaveBeenCalled();
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('AC-6.5: returns fieldErrors.title for 201 characters', async () => {
    const result = await updateTodoTitleAction('todo-1', 'x'.repeat(201));

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title must be 200 characters or fewer'] } });
    expect(lib.updateTodoTitle).not.toHaveBeenCalled();
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('AC-6.6: accepts 200 characters padded with spaces', async () => {
    const longest = 'x'.repeat(200);
    lib.updateTodoTitle.mockResolvedValue(todo({ title: longest }));

    const result = await updateTodoTitleAction('todo-1', `${' '.repeat(5)}${longest}${' '.repeat(5)}`);

    expect(result).toEqual({ ok: true, data: todo({ title: longest }) });
    expect(lib.updateTodoTitle).toHaveBeenCalledWith('todo-1', longest);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
  });

  it('AC-6.7: accepts a duplicate title', async () => {
    lib.updateTodoTitle.mockResolvedValue(todo({ id: 'todo-2', title: 'A' }));

    const result = await updateTodoTitleAction('todo-2', 'A');

    expect(result).toEqual({ ok: true, data: todo({ id: 'todo-2', title: 'A' }) });
    expect(lib.updateTodoTitle).toHaveBeenCalledWith('todo-2', 'A');
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
  });

  it('returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate', async () => {
    lib.updateTodoTitle.mockRejectedValue(new TodoNotFoundError('missing'));

    const result = await updateTodoTitleAction('missing', 'Buy milk');

    expect(result).toEqual({ ok: false, fieldErrors: { id: ['Todo not found'] } });
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('AC-10.1: resolves fieldErrors.form ["Could not save, try again"] when the lib rejects with another error and does not revalidate', async () => {
    lib.updateTodoTitle.mockRejectedValue(new Error('db down'));

    await expect(updateTodoTitleAction('todo-1', 'Buy milk')).resolves.toEqual({
      ok: false,
      fieldErrors: { form: ['Could not save, try again'] },
    });

    expect(lib.updateTodoTitle).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
  });
});

describe('clearCompletedTodosAction (§9)', () => {
  it('AC-9.1: deletes every completed todo, returns the count and revalidates / once', async () => {
    lib.clearCompletedTodos.mockResolvedValue(2);

    const result = await clearCompletedTodosAction();

    expect(result).toEqual({ ok: true, data: { deleted: 2 } });
    expect(lib.clearCompletedTodos).toHaveBeenCalledTimes(1);
    expect(lib.clearCompletedTodos).toHaveBeenCalledWith();
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('AC-9.1: returns { deleted: 0 } and still revalidates / when nothing was completed', async () => {
    lib.clearCompletedTodos.mockResolvedValue(0);

    const result = await clearCompletedTodosAction();

    expect(result).toEqual({ ok: true, data: { deleted: 0 } });
    expect(lib.clearCompletedTodos).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('AC-10.1: resolves fieldErrors.form ["Could not save, try again"] when the lib rejects and does not revalidate', async () => {
    lib.clearCompletedTodos.mockRejectedValue(new Error('db down'));

    await expect(clearCompletedTodosAction()).resolves.toEqual({
      ok: false,
      fieldErrors: { form: ['Could not save, try again'] },
    });

    expect(lib.clearCompletedTodos).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(0);
  });
});

describe('logging swallowed mutation failures (§11)', () => {
  it('AC-11.5: createTodoAction resolves the form failure and logs ("createTodoAction", the thrown error) exactly once', async () => {
    const error = new Error('db down');
    lib.createTodo.mockRejectedValue(error);

    const result = await createTodoAction(null, form('Buy milk'));

    expect(result).toEqual(formFailure());
    expect(JSON.stringify(result)).not.toContain('db down');
    expectLoggedOnce('createTodoAction', error);
  });

  it('AC-11.5: createTodoAction resolves the form failure and logs ("createTodoAction", the thrown error) exactly once when revalidatePath throws', async () => {
    const error = new Error('cache down');
    lib.createTodo.mockResolvedValue(todo());
    cache.revalidatePath.mockImplementation(() => {
      throw error;
    });

    const result = await createTodoAction(null, form('Buy milk'));

    expect(result).toEqual(formFailure());
    expect(JSON.stringify(result)).not.toContain('cache down');
    expectLoggedOnce('createTodoAction', error);
  });

  it('AC-11.5: toggleTodoAction resolves the form failure and logs ("toggleTodoAction", the thrown error) exactly once', async () => {
    const error = new Error('db down');
    lib.toggleTodo.mockRejectedValue(error);

    const result = await toggleTodoAction('todo-1');

    expect(result).toEqual(formFailure());
    expect(JSON.stringify(result)).not.toContain('db down');
    expectLoggedOnce('toggleTodoAction', error);
  });

  it('AC-11.5: updateTodoTitleAction resolves the form failure and logs ("updateTodoTitleAction", the thrown error) exactly once', async () => {
    const error = new Error('db down');
    lib.updateTodoTitle.mockRejectedValue(error);

    const result = await updateTodoTitleAction('todo-1', 'Buy milk');

    expect(result).toEqual(formFailure());
    expect(JSON.stringify(result)).not.toContain('db down');
    expectLoggedOnce('updateTodoTitleAction', error);
  });

  it('AC-11.5: clearCompletedTodosAction resolves the form failure and logs ("clearCompletedTodosAction", the thrown error) exactly once', async () => {
    const error = new Error('db down');
    lib.clearCompletedTodos.mockRejectedValue(error);

    const result = await clearCompletedTodosAction();

    expect(result).toEqual(formFailure());
    expect(JSON.stringify(result)).not.toContain('db down');
    expectLoggedOnce('clearCompletedTodosAction', error);
  });

  it('AC-11.6: logs nothing when each of the four actions succeeds, and still logs the next swallowed failure', async () => {
    lib.createTodo.mockResolvedValue(todo());
    lib.toggleTodo.mockResolvedValue(todo({ completed: true }));
    lib.updateTodoTitle.mockResolvedValue(todo());
    lib.clearCompletedTodos.mockResolvedValue(1);

    const results = [
      await createTodoAction(null, form('Buy milk')),
      await toggleTodoAction('todo-1'),
      await updateTodoTitleAction('todo-1', 'Buy milk'),
      await clearCompletedTodosAction(),
    ];

    expect(results.map((result) => result.ok)).toEqual([true, true, true, true]);
    expect(logger.logMutationFailure).toHaveBeenCalledTimes(0);

    const error = new Error('db down');
    lib.clearCompletedTodos.mockRejectedValue(error);

    const failed = await clearCompletedTodosAction();

    expect(failed).toEqual(formFailure());
    expectLoggedOnce('clearCompletedTodosAction', error);
  });

  it('AC-11.6: logs nothing when the title is invalid on create or edit, and still logs the next swallowed failure', async () => {
    const results = [
      await createTodoAction(null, form('   ')),
      await createTodoAction(null, form('x'.repeat(201))),
      await updateTodoTitleAction('todo-1', '   '),
    ];

    expect(results).toEqual([
      { ok: false, fieldErrors: { title: ['Title is required'] } },
      { ok: false, fieldErrors: { title: ['Title must be 200 characters or fewer'] } },
      { ok: false, fieldErrors: { title: ['Title is required'] } },
    ]);
    expect(logger.logMutationFailure).toHaveBeenCalledTimes(0);

    const error = new Error('db down');
    lib.createTodo.mockRejectedValue(error);

    const failed = await createTodoAction(null, form('Buy milk'));

    expect(failed).toEqual(formFailure());
    expectLoggedOnce('createTodoAction', error);
  });

  it('AC-11.6: logs nothing when toggle or edit finds no todo, and still logs the next swallowed failure', async () => {
    lib.toggleTodo.mockRejectedValueOnce(new TodoNotFoundError('todo-1'));
    lib.updateTodoTitle.mockRejectedValueOnce(new TodoNotFoundError('todo-1'));

    const results = [await toggleTodoAction('todo-1'), await updateTodoTitleAction('todo-1', 'Buy milk')];

    expect(results).toEqual([
      { ok: false, fieldErrors: { id: ['Todo not found'] } },
      { ok: false, fieldErrors: { id: ['Todo not found'] } },
    ]);
    expect(logger.logMutationFailure).toHaveBeenCalledTimes(0);

    const error = new Error('db down');
    lib.toggleTodo.mockRejectedValueOnce(error);

    const failed = await toggleTodoAction('todo-1');

    expect(failed).toEqual(formFailure());
    expectLoggedOnce('toggleTodoAction', error);
  });
});
