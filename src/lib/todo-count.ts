// §13 remaining count: pure, no server-only, so a client component may import it too.

export function countRemaining(todos: readonly { readonly completed: boolean }[]): number {
  return todos.filter((todo) => !todo.completed).length;
}

export function remainingLabel(count: number): string {
  return count === 1 ? `${count} item left` : `${count} items left`;
}
