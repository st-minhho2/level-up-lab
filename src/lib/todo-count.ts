// §13 remaining count, §22 "all done": pure, no server-only, so a client component may import it too.

// §22: the one message, shown only while nothing is left; module-private because §22 adds one export.
const ALL_DONE_MESSAGE = 'All done';

export function countRemaining(todos: readonly { readonly completed: boolean }[]): number {
  return todos.filter((todo) => !todo.completed).length;
}

export function remainingLabel(count: number): string {
  return count === 1 ? `${count} item left` : `${count} items left`;
}

export function allDoneMessage(count: number): string | undefined {
  return count === 0 ? ALL_DONE_MESSAGE : undefined;
}
