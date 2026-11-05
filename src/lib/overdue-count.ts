// §23 overdue count: how many stored todos are overdue by §17's rule, and the text shown for that number.
// Pure: no Prisma, no server-only, so a client component may import it.
import { NotImplementedError } from '@/lib/errors';

export function countOverdue(
  todos: readonly { readonly completed: boolean; readonly dueDate?: string }[],
  today: string,
): number {
  void todos;
  void today;
  throw new NotImplementedError('countOverdue');
}

export function overdueLabel(count: number): string | undefined {
  void count;
  throw new NotImplementedError('overdueLabel');
}
