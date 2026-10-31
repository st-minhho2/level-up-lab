// §16 search the list by title (B2.5): pure, no Prisma, no server-only, so a client component may import it too.
// Skeleton: the bodies are written by the green commit.
import { NotImplementedError } from '@/lib/errors';
import type { TodoFilter } from '@/lib/todo-filter';
import { TITLE_MAX_LENGTH } from '@/lib/todo-schema';

// REQ-16.1, REQ-16.5: the search limit is the title limit of §5, one definition.
export const SEARCH_QUERY_MAX_LENGTH: number = TITLE_MAX_LENGTH;

export function parseSearchQuery(value: string | string[] | undefined): string {
  throw new NotImplementedError(`parseSearchQuery(${String(value)})`);
}

export function searchTodos<T extends { readonly title: string }>(todos: readonly T[], query: string): T[] {
  throw new NotImplementedError(`searchTodos(${String(todos.length)}, ${query})`);
}

export function searchEmptyMessage(filter: TodoFilter, totalCount: number, query: string): string {
  throw new NotImplementedError(`searchEmptyMessage(${filter}, ${String(totalCount)}, ${query})`);
}
