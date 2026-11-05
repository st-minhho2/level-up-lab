// §26 the browser tab title shows the remaining count: pure, no Prisma, no server-only.
import { NotImplementedError } from '@/lib/errors';

export function pageTitle(remaining: number): string {
  throw new NotImplementedError(`pageTitle(${String(remaining)})`);
}
