// §36 complete-all label: the §14 button's text with the count of stored open todos.
// Pure: no Prisma, no server-only, so a client component may import it.
import { NotImplementedError } from '@/lib/errors';

// REQ-36.1 / REQ-36.2: the count only when at least one todo would be marked, never padded.
export function completeAllLabel(open: number): string {
  throw new NotImplementedError(`completeAllLabel(${String(open)})`);
}
