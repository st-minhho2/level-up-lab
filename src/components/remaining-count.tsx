// §13 RemainingCount: a Server Component (no state, no events), rendered by the page outside the list.
import type { ReactNode } from 'react';
import { remainingLabel } from '@/lib/todo-count';

export function RemainingCount({ count }: { readonly count: number }): ReactNode {
  return <p>{remainingLabel(count)}</p>;
}
