// §13 RemainingCount, §22 "all done", §34 announced through one polite role="status" element that is always rendered,
// so a count change updates its contents instead of replacing it. A Server Component (no state, no events).
import type { ReactNode } from 'react';
import { allDoneMessage, remainingLabel } from '@/lib/todo-count';

export function RemainingCount({ count }: { readonly count: number }): ReactNode {
  const message = allDoneMessage(count);
  return (
    <div role="status">
      <p>{remainingLabel(count)}</p>
      {message === undefined ? undefined : <span>{message}</span>}
    </div>
  );
}
