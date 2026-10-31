// §12 filter the list (B2.1): pure, no Prisma, no server-only. Skeleton: the bodies are written by the green commit.
import { NotImplementedError } from '@/lib/errors';

export type TodoFilter = 'all' | 'active' | 'completed';

export function parseTodoFilter(value: string | string[] | undefined): TodoFilter {
  throw new NotImplementedError(`parseTodoFilter(${String(value)})`);
}

export function filterTodos<T extends { readonly completed: boolean }>(todos: readonly T[], filter: TodoFilter): T[] {
  throw new NotImplementedError(`filterTodos(${String(todos.length)}, ${filter})`);
}

export function emptyListMessage(filter: TodoFilter, totalCount: number): string {
  throw new NotImplementedError(`emptyListMessage(${filter}, ${String(totalCount)})`);
}
