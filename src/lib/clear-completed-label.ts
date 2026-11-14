// §32 clear-completed label: the §9 button's text with the count of stored completed todos.
// Pure: no Prisma, no server-only, so a client component may import it.
import { NotImplementedError } from '@/lib/errors';

export function clearCompletedLabel(completed: number): string {
  throw new NotImplementedError(`clearCompletedLabel(${String(completed)})`);
}
