import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoNotFoundError } from '@/lib/todos';
import { deleteTodo } from './todo-delete';

// Every prisma.todo method the app uses, so "no other prisma.todo method is called" is observable (AC-19.1).
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
      .filter(([name]) => name !== 'deleteMany')
      .map(([name, method]) => [name, method.mock.calls.length]),
  );
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('deleteTodo (§19)', () => {
  it('AC-19.1: resolves undefined for a deleted id, rejects TodoNotFoundError with id "missing" when nothing was deleted, calls deleteMany exactly twice by id and no other prisma.todo method', async () => {
    db.deleteMany.mockResolvedValueOnce(batchPayload(1)).mockResolvedValueOnce(batchPayload(0));

    const first = await deleteTodo('todo-1');
    const second = await deleteTodo('missing').then(
      () => undefined,
      (error: unknown) => error,
    );

    expect(first).toBeUndefined();
    expect(second).toBeInstanceOf(TodoNotFoundError);
    expect(second instanceof TodoNotFoundError ? second.id : undefined).toBe('missing');
    expect(db.deleteMany).toHaveBeenCalledTimes(2);
    expect(db.deleteMany.mock.calls[0]).toEqual([{ where: { id: 'todo-1' } }]);
    expect(db.deleteMany.mock.calls[1]).toEqual([{ where: { id: 'missing' } }]);
    expect(otherMethodCalls()).toEqual({
      findMany: 0,
      create: 0,
      findUnique: 0,
      update: 0,
      updateMany: 0,
      delete: 0,
    });
  });

  it('rethrows a storage error unchanged', async () => {
    const error = new Error('db down');
    db.deleteMany.mockRejectedValue(error);

    const outcome = deleteTodo('todo-1');

    await expect(outcome).rejects.toBe(error);
    expect(db.deleteMany).toHaveBeenCalledTimes(1);
  });
});
