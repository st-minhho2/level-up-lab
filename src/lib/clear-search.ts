// §21 the "Clear search" link (B4.2): pure, no Prisma, no server-only, so the §16 search form may import it.
// Skeleton: the bodies are written by the green commit.
import { NotImplementedError } from '@/lib/errors';
import type { TodoFilter } from '@/lib/todo-filter';

// REQ-21.1: the link's text and accessible name.
export const CLEAR_SEARCH_LABEL = 'Clear search';

export function isSearchInEffect(query: string): boolean {
  throw new NotImplementedError(`isSearchInEffect(${query})`);
}

export function clearSearchHref(filter: TodoFilter): string {
  throw new NotImplementedError(`clearSearchHref(${filter})`);
}
