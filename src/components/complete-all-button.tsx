'use client';

// §14 CompleteAllButton; §10 the message of a failed mark-all, directly after the button.
import { useState, useTransition, type ReactNode } from 'react';
import { completeAllTodosAction } from '@/actions/complete-all';

export function CompleteAllButton({ disabled }: { readonly disabled: boolean }): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

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
        disabled={disabled || pending}
        className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        Mark all complete
      </button>
      {error !== undefined && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
