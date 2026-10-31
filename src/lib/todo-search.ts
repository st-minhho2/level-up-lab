// §16 search the list by title (B2.5): pure, no Prisma, no server-only, so a client component may import it too.
import { emptyListMessage, type TodoFilter } from '@/lib/todo-filter';
import { TITLE_MAX_LENGTH } from '@/lib/todo-schema';

// REQ-16.1, REQ-16.5: the search limit is the title limit of §5, one definition.
export const SEARCH_QUERY_MAX_LENGTH: number = TITLE_MAX_LENGTH;

// REQ-16.2, REQ-16.4: a repeated parameter (an array) is no search; never truncates, so a long query matches nothing.
export function parseSearchQuery(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

// REQ-16.3, REQ-16.5, REQ-16.9: plain substring, case-insensitive, no accent folding; `filter` keeps input order and
// returns a new array. No shortcut for '': `includes('')` is true for every title.
// D-21, REQ-16.5: the length check runs on the trimmed query before lowercasing, because `toLowerCase` can lengthen a
// title (200 'İ' become 400 code units) and let an over-long query match.
export function searchTodos<T extends { readonly title: string }>(todos: readonly T[], query: string): T[] {
  const trimmed = query.trim();
  if (trimmed.length > SEARCH_QUERY_MAX_LENGTH) {
    return [];
  }
  const needle = trimmed.toLowerCase();
  return todos.filter((todo) => todo.title.toLowerCase().includes(needle));
}

// REQ-16.8: an empty store wins over the search, the search over the §12 filter text.
export function searchEmptyMessage(filter: TodoFilter, totalCount: number, query: string): string {
  if (totalCount === 0) {
    return emptyListMessage(filter, totalCount);
  }
  return query.trim() === '' ? emptyListMessage(filter, totalCount) : 'No todos match your search';
}
