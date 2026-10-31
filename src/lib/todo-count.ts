// §13 remaining count: pure, no server-only, so a client component may import it too.
import { NotImplementedError } from '@/lib/errors';

export function countRemaining(todos: readonly { readonly completed: boolean }[]): number {
  throw new NotImplementedError(`countRemaining(${todos.length})`);
}

export function remainingLabel(count: number): string {
  throw new NotImplementedError(`remainingLabel(${count})`);
}
