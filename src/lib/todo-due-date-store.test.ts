import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listTodos, setTodoDueDate, TodoNotFoundError } from './todos';

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: { todo: db } }));

interface StoredRow {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly dueDate: Date | null;
}

let counter = 0;
function makeRow(overrides: Partial<StoredRow> = {}): StoredRow {
  counter += 1;
  return {
    id: `id-${counter}`,
    title: `Todo ${counter}`,
    completed: false,
    createdAt: new Date(2026, 0, counter),
    dueDate: null,
    ...overrides,
  };
}

function utcMidnight(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

// `update` echoes the stored row with the due date it was given, as Prisma returns the updated row.
function echoUpdate(row: StoredRow): void {
  db.update.mockImplementation(({ data }: { data: { dueDate: Date | null } }) =>
    Promise.resolve({ ...row, dueDate: data.dueDate }),
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listTodos with due dates (§15)', () => {
  it('AC-15.2: maps a stored day to "2026-11-05" and null to no dueDate, and selects dueDate', async () => {
    const due = makeRow({ title: 'B', dueDate: utcMidnight('2026-11-05') });
    const plain = makeRow({ title: 'A', dueDate: null });
    db.findMany.mockResolvedValue([due, plain]);

    const todos = await listTodos();

    expect(todos).toEqual([
      { id: due.id, title: 'B', completed: false, createdAt: due.createdAt, dueDate: '2026-11-05' },
      { id: plain.id, title: 'A', completed: false, createdAt: plain.createdAt },
    ]);
    expect(todos[1]?.dueDate).toBeUndefined();
    expect(db.findMany.mock.calls[0]?.[0]).toMatchObject({ select: { dueDate: true } });
  });
});

describe('setTodoDueDate (§15)', () => {
  it('AC-15.2: stores data exactly { dueDate: UTC midnight } then { dueDate: null } for todo-1 and returns the todo with its title, completed, createdAt and dueDate', async () => {
    const row = makeRow({ id: 'todo-1', title: 'B', completed: true });
    db.findUnique.mockResolvedValue({ id: 'todo-1' });
    echoUpdate(row);

    const set = await setTodoDueDate('todo-1', '2026-11-05');
    const cleared = await setTodoDueDate('todo-1', undefined);

    expect(db.update).toHaveBeenCalledTimes(2);
    expect(db.update.mock.calls[0]?.[0]).toMatchObject({ where: { id: 'todo-1' } });
    expect((db.update.mock.calls[0]?.[0] as { data: unknown }).data).toEqual({
      dueDate: new Date('2026-11-05T00:00:00.000Z'),
    });
    expect(db.update.mock.calls[1]?.[0]).toMatchObject({ where: { id: 'todo-1' } });
    expect((db.update.mock.calls[1]?.[0] as { data: unknown }).data).toEqual({ dueDate: null });
    expect(set).toEqual({
      id: 'todo-1',
      title: 'B',
      completed: true,
      createdAt: row.createdAt,
      dueDate: '2026-11-05',
    });
    expect(cleared).toEqual({ id: 'todo-1', title: 'B', completed: true, createdAt: row.createdAt });
    expect(cleared.dueDate).toBeUndefined();
  });

  it('AC-15.2: rejects with TodoNotFoundError for a missing id after a set and a clear, and update is called 2 times in total', async () => {
    const row = makeRow({ id: 'todo-1' });
    db.findUnique
      .mockResolvedValueOnce({ id: 'todo-1' })
      .mockResolvedValueOnce({ id: 'todo-1' })
      .mockResolvedValueOnce(null);
    echoUpdate(row);
    await setTodoDueDate('todo-1', '2026-11-05');
    await setTodoDueDate('todo-1', undefined);

    const missing = setTodoDueDate('missing', '2026-11-05');

    await expect(missing).rejects.toBeInstanceOf(TodoNotFoundError);
    expect(db.update).toHaveBeenCalledTimes(2);
  });
});
