// §13 RemainingCount: a Server Component (no state, no events), rendered by the page outside the list.
import type { ReactNode } from 'react';
import { NotImplementedError } from '@/lib/errors';

export function RemainingCount({ count }: { readonly count: number }): ReactNode {
  throw new NotImplementedError(`RemainingCount(${count})`);
}
