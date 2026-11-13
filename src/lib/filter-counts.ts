// §30 filter counts: how many stored todos each §12 filter link lists.
// Pure: no Prisma, no server-only, so a client component may import it.

export interface FilterCounts {
  readonly all: number;
  readonly active: number;
  readonly completed: number;
}

// REQ-30.1: All = every todo, Active = not completed, Completed = completed; the input is only read.
export function filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts {
  const completed = todos.filter((todo) => todo.completed).length;
  return { all: todos.length, active: todos.length - completed, completed };
}
