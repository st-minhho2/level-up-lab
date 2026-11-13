// §30 filter counts: how many stored todos each §12 filter link lists.
// Pure: no Prisma, no server-only, so a client component may import it.
import { NotImplementedError } from '@/lib/errors';

export interface FilterCounts {
  readonly all: number;
  readonly active: number;
  readonly completed: number;
}

export function filterCounts(todos: readonly { readonly completed: boolean }[]): FilterCounts {
  void todos;
  throw new NotImplementedError('filterCounts');
}
