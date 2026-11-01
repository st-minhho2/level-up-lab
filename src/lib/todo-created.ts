// §20 created date: a todo's creation day as the UTC 'YYYY-MM-DD' of its createdAt, and its row wording.
// Pure: no Prisma, no server-only, so a client component may import it.
import { NotImplementedError } from '@/lib/errors';

export const CREATED_PREFIX = 'Created ';

export function createdDayOf(createdAt: Date): string {
  void createdAt;
  throw new NotImplementedError('createdDayOf');
}

export function createdLabel(createdAt: Date): string {
  void createdAt;
  throw new NotImplementedError('createdLabel');
}
