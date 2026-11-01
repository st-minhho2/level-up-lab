// §13 RemainingCount, §22 "all done": a Server Component (no state, no events), rendered by the page outside the list.
import type { ReactNode } from 'react';
import { allDoneMessage, remainingLabel } from '@/lib/todo-count';

export function RemainingCount({ count }: { readonly count: number }): ReactNode {
  const message = allDoneMessage(count);
  return (
    <>
      <p>{remainingLabel(count)}</p>
      {message === undefined ? undefined : <span>{message}</span>}
    </>
  );
}
