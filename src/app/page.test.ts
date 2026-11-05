import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Todo } from '@/lib/todos';
import { generateMetadata } from './page';

const lib = vi.hoisted(() => ({ listTodos: vi.fn<() => Promise<Todo[]>>() }));

vi.mock('@/lib/todos', () => ({ listTodos: lib.listTodos }));
// The page's client components import the actions, whose modules reach `server-only` through the Prisma client.
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

let sequence = 0;

function todo(title: string, completed: boolean): Todo {
  sequence += 1;
  return { id: `todo-${title}-${String(sequence)}`, title, completed, createdAt: new Date(2026, 0, sequence) };
}

beforeEach(() => {
  lib.listTodos.mockReset();
});

describe('generateMetadata (§26)', () => {
  it('AC-26.2: the title is exactly "(3) Todos" for open, done, open, done, open', async () => {
    lib.listTodos.mockResolvedValue([
      todo('E', false),
      todo('D', true),
      todo('C', false),
      todo('B', true),
      todo('A', false),
    ]);

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('(3) Todos');
  });

  it('AC-26.3: the title is exactly "Todos" for an empty list', async () => {
    lib.listTodos.mockResolvedValue([]);

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Todos');
  });

  it('AC-26.3: the title is exactly "Todos" for two done todos', async () => {
    lib.listTodos.mockResolvedValue([todo('B', true), todo('A', true)]);

    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Todos');
  });
});
