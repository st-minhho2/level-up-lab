// §12 filter the list (B2.1): pure, no Prisma, no server-only, so a client component may import it too.

export type TodoFilter = 'all' | 'active' | 'completed';

// REQ-12.8: the §12 empty-list texts; an empty store reads "No todos yet" under every filter.
const EMPTY_LIST_MESSAGES: Readonly<Record<TodoFilter, string>> = {
  all: 'No todos yet',
  active: 'No active todos',
  completed: 'No completed todos',
};

// REQ-12.5: only the exact strings select; a repeated parameter (an array) and anything else fall back to All.
export function parseTodoFilter(value: string | string[] | undefined): TodoFilter {
  if (value === 'active' || value === 'completed') {
    return value;
  }
  return 'all';
}

// REQ-12.2 to REQ-12.4, REQ-12.9: `filter` keeps input order and always returns a new array.
export function filterTodos<T extends { readonly completed: boolean }>(todos: readonly T[], filter: TodoFilter): T[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'all':
      return [...todos];
  }
}

export function emptyListMessage(filter: TodoFilter, totalCount: number): string {
  return totalCount === 0 ? EMPTY_LIST_MESSAGES.all : EMPTY_LIST_MESSAGES[filter];
}
