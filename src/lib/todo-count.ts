// §13 remaining count, §22 "all done": pure, no server-only, so a client component may import it too.
import { NotImplementedError } from '@/lib/errors';

export function countRemaining(todos: readonly { readonly completed: boolean }[]): number {
  return todos.filter((todo) => !todo.completed).length;
}

export function remainingLabel(count: number): string {
  return count === 1 ? `${count} item left` : `${count} items left`;
}

export function allDoneMessage(count: number): string | undefined {
  void count;
  throw new NotImplementedError('allDoneMessage');
}
