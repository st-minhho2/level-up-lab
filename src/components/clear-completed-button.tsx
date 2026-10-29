'use client';

// §9 ClearCompletedButton; §10 the message of a failed clear, directly after the button.
import { useState, useTransition, type ReactNode } from 'react';
import { clearCompletedTodosAction } from '@/actions/todos';

export function ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  // The deleted count has no UI (§9 out of scope); the only result the button reads is the §10 `form` error, which
  // the next successful attempt clears (REQ-10.5).
  function onClear(): void {
    startTransition(async () => {
      const result = await clearCompletedTodosAction();
      setError(result.ok ? undefined : result.fieldErrors.form?.[0]);
    });
  }

  // One wrapper so the message is the button's next sibling (REQ-10.4); the page's column layout sees one block.
  return (
    <div className="flex flex-col items-start gap-1 self-start">
      <button
        type="button"
        onClick={onClear}
        disabled={disabled || pending}
        className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
      >
        Clear completed
      </button>
      {error !== undefined && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
