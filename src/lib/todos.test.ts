import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTodo, listTodos, TodoNotFoundError, toggleTodo } from './todos';

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: { todo: db } }));

let counter = 0;
function makeRow(overrides: Partial<{ id: string; title: string; completed: boolean; createdAt: Date }> = {}) {
  counter += 1;
  return {
    id: `id-${counter}`,
    title: `Todo ${counter}`,
    completed: false,
    createdAt: new Date(2026, 0, counter),
    updatedAt: new Date(2026, 0, counter),
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listTodos', () => {
  it('AC-1: returns todos newest first with id, title and completed', async () => {
    const [a, b, c] = [makeRow({ title: 'A' }), makeRow({ title: 'B' }), makeRow({ title: 'C' })];
    db.findMany.mockResolvedValue([c, b, a]);

    const todos = await listTodos();

    expect(todos.map((todo) => todo.title)).toEqual(['C', 'B', 'A']);
    expect(todos.map((todo) => ({ id: todo.id, completed: todo.completed }))).toEqual([
      { id: c.id, completed: false },
      { id: b.id, completed: false },
      { id: a.id, completed: false },
    ]);
    expect(db.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: 'desc' } }));
  });
});

describe('createTodo', () => {
  it('AC-2: stores the given title as a not-completed todo and returns it', async () => {
    db.create.mockImplementation(({ data }: { data: { title: string } }) =>
      Promise.resolve(makeRow({ title: data.title })),
    );

    const todo = await createTodo('Buy milk');

    expect(todo).toMatchObject({ title: 'Buy milk', completed: false });
    expect(db.create).toHaveBeenCalledTimes(1);
    expect(db.create.mock.calls[0]?.[0]).toMatchObject({ data: { title: 'Buy milk' } });
  });
});

describe('toggleTodo', () => {
  it('AC-4: inverts completed and stores it, twice in a row', async () => {
    const row = makeRow({ completed: false });
    db.findUnique.mockResolvedValueOnce(row).mockResolvedValueOnce({ ...row, completed: true });
    db.update.mockImplementation(({ data }: { data: { completed: boolean } }) =>
      Promise.resolve({ ...row, completed: data.completed }),
    );

    const first = await toggleTodo(row.id);
    const second = await toggleTodo(row.id);

    expect(first.completed).toBe(true);
    expect(second.completed).toBe(false);
    expect(db.update.mock.calls[0]?.[0]).toMatchObject({ where: { id: row.id }, data: { completed: true } });
    expect(db.update.mock.calls[1]?.[0]).toMatchObject({ where: { id: row.id }, data: { completed: false } });
  });

  it('AC-5: throws TodoNotFoundError for an unknown id and updates nothing', async () => {
    db.findUnique.mockResolvedValue(null);

    await expect(toggleTodo('missing')).rejects.toBeInstanceOf(TodoNotFoundError);
    await expect(toggleTodo('missing')).rejects.toMatchObject({ id: 'missing' });
    expect(db.update).not.toHaveBeenCalled();
  });
});
