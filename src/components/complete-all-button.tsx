'use client';

// §14 CompleteAllButton; §10 the message of a failed mark-all, directly after the button; §36 the optional count;
// §43 nothing is rendered while no stored todo is open; §52 a shown failure message is the button's description.
import { useId, useState, useTransition, type ReactNode } from 'react';
import { completeAllTodosAction } from '@/actions/complete-all';
import { completeAllLabel } from '@/lib/complete-all-label';

export function CompleteAllButton({
  disabled,
  count,
}: {
  readonly disabled: boolean;
  readonly count?: number;
}): ReactNode {
  // §43 REQ-43.1: no element at all. Unmounting the shown button also drops its failure message, so it cannot come
  // back when the button reappears (REQ-43.4); focus is left to the browser (REQ-43.5).
  if (disabled) {
    return null;
  }
  return <CompleteAllButtonShown count={count} />;
}

function CompleteAllButtonShown({ count }: { readonly count?: number }): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  // §52: generated here, after §43's early return, so the unmount drops the message and its id together (REQ-52.5).
  const messageId = useId();

  // The updated count has no UI (§14 out of scope); the only result the button reads is the §10 `form` error, which
  // the next successful attempt clears (REQ-14.10).
  function onCompleteAll(): void {
    startTransition(async () => {
      const result = await completeAllTodosAction();
      setError(result.ok ? undefined : result.fieldErrors.form?.[0]);
    });
  }

  // One wrapper so the message is the button's next sibling (REQ-14.9); the page's column layout sees one block.
  return (
    <div className="flex flex-col items-start gap-1 self-start">
      <button
        type="button"
        onClick={onCompleteAll}
        disabled={pending}
        // §52 REQ-52.2: no attribute at all while no message is shown, so it never points at a missing element.
        aria-describedby={error !== undefined ? messageId : undefined}
        className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        {/* §36 REQ-36.6: without a count the label is §14's plain text. */}
        {completeAllLabel(count ?? 0)}
      </button>
      {error !== undefined && (
        <p id={messageId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
