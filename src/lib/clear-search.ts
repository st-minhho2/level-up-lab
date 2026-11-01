// §21 the "Clear search" link (B4.2): pure, no Prisma, no server-only, so the §16 search form may import it.
import type { TodoFilter } from '@/lib/todo-filter';

// REQ-21.1: the link's text and accessible name.
export const CLEAR_SEARCH_LABEL = 'Clear search';

// REQ-21.1, REQ-21.2: the same trim as parseSearchQuery (§16), so a search is in effect exactly when §16 applies one.
export function isSearchInEffect(query: string): boolean {
  return query.trim() !== '';
}

// REQ-21.3: keeps the selected filter at its §12 address (All is the bare `/`) and never carries a `q`.
export function clearSearchHref(filter: TodoFilter): string {
  return filter === 'all' ? '/' : `/?filter=${filter}`;
}
