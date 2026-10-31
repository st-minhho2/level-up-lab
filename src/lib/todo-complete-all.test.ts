import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeAllTodos } from './todo-complete-all';

// Every prisma.todo method the app uses, so "no other method is called" is observable (AC-14.1).
const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: { todo: db } }));

function batchPayload(count: number): { count: number } {
  return { count };
}

function otherMethodCalls(): Record<string, number> {
  return Object.fromEntries(
    Object.entries(db)
      .filter(([name]) => name !== 'updateMany')
      .map(([name, method]) => [name, method.mock.calls.length]),
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('completeAllTodos (§14)', () => {
  it('AC-14.1: updates exactly the not-completed rows to completed and returns the count', async () => {
    db.updateMany.mockResolvedValue(batchPayload(2));

    const updated = await completeAllTodos();

    expect(updated).toBe(2);
    expect(db.updateMany).toHaveBeenCalledTimes(1);
    expect(db.updateMany.mock.calls[0]).toEqual([{ where: { completed: false }, data: { completed: true } }]);
    expect(otherMethodCalls()).toEqual({
      findMany: 0,
      create: 0,
      findUnique: 0,
      update: 0,
      delete: 0,
      deleteMany: 0,
    });
  });

  it('resolves 0 and still scopes the update to completed: false when no todo is open (REQ-14.7)', async () => {
    db.updateMany.mockResolvedValue(batchPayload(0));

    const updated = await completeAllTodos();

    expect(updated).toBe(0);
    expect(db.updateMany).toHaveBeenCalledTimes(1);
    expect(db.updateMany.mock.calls[0]).toEqual([{ where: { completed: false }, data: { completed: true } }]);
  });
});
