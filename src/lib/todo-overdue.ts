// §17 overdue: "today" as the browser's local calendar day and the overdue rule on two 'YYYY-MM-DD' strings.
// Pure: no Prisma, no server-only, so a client component may import it.
import { NotImplementedError } from '@/lib/errors';

export const OVERDUE_LABEL = 'Overdue';

export function todayOf(now: Date): string {
  void now;
  throw new NotImplementedError('todayOf');
}

export function isOverdue(dueDate: string | undefined, today: string, completed: boolean): boolean {
  void [dueDate, today, completed];
  throw new NotImplementedError('isOverdue');
}
