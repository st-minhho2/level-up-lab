import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoNotFoundError } from '@/lib/todos';
import { createTodoAction, toggleTodoAction } from './todos';

const lib = vi.hoisted(() => ({ createTodo: vi.fn(), toggleTodo: vi.fn() }));
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/todos', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/todos')>()),
  createTodo: lib.createTodo,
  toggleTodo: lib.toggleTodo,
}));
vi.mock('next/cache', () => ({ revalidatePath: cache.revalidatePath }));

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
  it('AC-2: creates the trimmed title as a not-completed todo and revalidates / once', async () => {
    lib.createTodo.mockResolvedValue(todo());

    const result = await createTodoAction(null, form('  Buy milk  '));

    expect(result).toMatchObject({ ok: true, data: { title: 'Buy milk', completed: false } });
    expect(lib.createTodo).toHaveBeenCalledWith('Buy milk');
    expect(cache.revalidatePath).toHaveBeenCalledTimes(1);
    expect(cache.revalidatePath).toHaveBeenCalledWith('/');
  });

  it('AC-3: returns fieldErrors.title ["Title is required"] for a blank title and stores nothing', async () => {
    const result = await createTodoAction(null, form('   '));

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title is required'] } });
    expect(lib.createTodo).not.toHaveBeenCalled();
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('AC-3: returns fieldErrors.title ["Title must be 200 characters or fewer"] for 201 characters', async () => {
    const result = await createTodoAction(null, form('x'.repeat(201)));

    expect(result).toEqual({ ok: false, fieldErrors: { title: ['Title must be 200 characters or fewer'] } });
    expect(lib.createTodo).not.toHaveBeenCalled();
  });
});

describe('toggleTodoAction', () => {
  it('AC-4: returns the toggled todo and revalidates /', async () => {
    lib.toggleTodo.mockResolvedValueOnce(todo({ completed: true })).mockResolvedValueOnce(todo({ completed: false }));

    const first = await toggleTodoAction('todo-1');
    const second = await toggleTodoAction('todo-1');

    expect(first).toMatchObject({ ok: true, data: { id: 'todo-1', completed: true } });
    expect(second).toMatchObject({ ok: true, data: { id: 'todo-1', completed: false } });
    expect(lib.toggleTodo).toHaveBeenCalledTimes(2);
    expect(cache.revalidatePath).toHaveBeenCalledTimes(2);
  });

  it('AC-5: returns fieldErrors.id ["Todo not found"] for an unknown id and does not revalidate', async () => {
    lib.toggleTodo.mockRejectedValue(new TodoNotFoundError('missing'));

    const result = await toggleTodoAction('missing');

    expect(result).toEqual({ ok: false, fieldErrors: { id: ['Todo not found'] } });
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });
});
