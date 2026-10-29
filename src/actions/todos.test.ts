import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoNotFoundError } from '@/lib/todos';
import { clearCompletedTodosAction, createTodoAction, toggleTodoAction, updateTodoTitleAction } from './todos';

const lib = vi.hoisted(() => ({
  createTodo: vi.fn(),
  toggleTodo: vi.fn(),
  updateTodoTitle: vi.fn(),
  clearCompletedTodos: vi.fn(),
}));
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/todos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/todos')>()),
  createTodo: lib.createTodo,
  toggleTodo: lib.toggleTodo,
  updateTodoTitle: lib.updateTodoTitle,
  clearCompletedTodos: lib.clearCompletedTodos,
}));
vi.mock('next/cache', () => ({ revalidatePath: cache.revalidatePath }));
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

  it('AC-5.3: returns fieldErrors.title ["Title must be 200 characters or fewer"] for 201 characters', async () => {
    const result = await createTodoAction(null, form('x'.repeat(201)));

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title must be 200 characters or fewer'] } });
    expect(lib.createTodo).not.toHaveBeenCalled();
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
