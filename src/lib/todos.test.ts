import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearCompletedTodos, createTodo, listTodos, TodoNotFoundError, toggleTodo, updateTodoTitle } from './todos';

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
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
  it('AC-5.1: returns todos newest first with id, title and completed', async () => {
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
  it('AC-5.2: stores the given title as a not-completed todo and returns it', async () => {
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
  it('AC-5.4: inverts completed and stores it, twice in a row', async () => {
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

  it('AC-5.5: throws TodoNotFoundError for an unknown id and updates nothing', async () => {
    db.findUnique.mockResolvedValue(null);

    await expect(toggleTodo('missing')).rejects.toBeInstanceOf(TodoNotFoundError);
    await expect(toggleTodo('missing')).rejects.toMatchObject({ id: 'missing' });
    expect(db.update).not.toHaveBeenCalled();
  });
});

interface UpdateArgs {
  where: { id: string };
  data: Record<string, unknown>;
  select: Record<string, boolean>;
}

function updateCall(index: number): UpdateArgs {
  return db.update.mock.calls[index]?.[0] as UpdateArgs;
}

// Mirrors Prisma's `select`: only the requested fields come back, so a shrunken or widened select is visible.
function pick(row: Record<string, unknown>, fields: Record<string, boolean>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([key]) => fields[key] === true));
}

function stubStoredRow(row: ReturnType<typeof makeRow>): void {
  db.findUnique.mockResolvedValue({ id: row.id });
  db.update.mockImplementation(({ data, select }: UpdateArgs) => Promise.resolve(pick({ ...row, ...data }, select)));
}

describe('updateTodoTitle (§6)', () => {
  it('AC-6.2: stores the new title with data { title } only', async () => {
    const row = makeRow({ title: 'Buy mik' });
    stubStoredRow(row);

    const todo = await updateTodoTitle(row.id, 'Buy milk');

    expect(todo).toEqual({ id: row.id, title: 'Buy milk', completed: false, createdAt: row.createdAt });
    expect(db.update).toHaveBeenCalledTimes(1);
    expect(updateCall(0).where).toEqual({ id: row.id });
    expect(updateCall(0).data).toEqual({ title: 'Buy milk' });
  });

  it('AC-6.3: does not touch completed or createdAt', async () => {
    const row = makeRow({ title: 'B', completed: true });
    stubStoredRow(row);

    const todo = await updateTodoTitle(row.id, 'B2');

    expect(todo).toEqual({ id: row.id, title: 'B2', completed: true, createdAt: row.createdAt });
    expect(Object.keys(updateCall(0).data)).toEqual(['title']);
  });

  it('AC-6.7: allows a title equal to another todo', async () => {
    const [a, b] = [makeRow({ title: 'A' }), makeRow({ title: 'B' })];
    stubStoredRow(b);

    const todo = await updateTodoTitle(b.id, a.title);

    expect(todo).toEqual({ id: b.id, title: 'A', completed: false, createdAt: b.createdAt });
    expect(updateCall(0).where).toEqual({ id: b.id });
    expect(updateCall(0).data).toEqual({ title: 'A' });
  });

  it('throws TodoNotFoundError for an unknown id and updates nothing', async () => {
    db.findUnique.mockResolvedValue(null);

    await expect(updateTodoTitle('missing', 'Buy milk')).rejects.toBeInstanceOf(TodoNotFoundError);
    await expect(updateTodoTitle('missing', 'Buy milk')).rejects.toMatchObject({ id: 'missing' });
    expect(db.update).not.toHaveBeenCalled();
  });
});

describe('clearCompletedTodos (§9)', () => {
  it('AC-9.1: deletes exactly the completed rows and returns the count', async () => {
    db.deleteMany.mockResolvedValue({ count: 2 });

    const deleted = await clearCompletedTodos();

    expect(deleted).toBe(2);
    expect(db.deleteMany).toHaveBeenCalledTimes(1);
    expect(db.deleteMany).toHaveBeenCalledWith({ where: { completed: true } });
  });

  // REQ-9.7: nothing completed → nothing deleted, the delete is still scoped to completed rows.
  it('AC-9.1: returns 0 and still issues one deleteMany when nothing is completed', async () => {
    db.deleteMany.mockResolvedValue({ count: 0 });

    const deleted = await clearCompletedTodos();

    expect(deleted).toBe(0);
    expect(db.deleteMany).toHaveBeenCalledTimes(1);
    expect(db.deleteMany).toHaveBeenCalledWith({ where: { completed: true } });
  });
});
