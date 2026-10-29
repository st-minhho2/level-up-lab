'use client';

// §9 ClearCompletedButton.
import { useTransition, type ReactNode } from 'react';
import { clearCompletedTodosAction } from '@/actions/todos';

export function ClearCompletedButton({ disabled }: { readonly disabled: boolean }): ReactNode {
  const [pending, startTransition] = useTransition();

  // The result is ignored: the deleted count has no UI (§9 out of scope) and the action never returns a failure arm.
  function onClear(): void {
    startTransition(async () => {
      await clearCompletedTodosAction();
    });
  }

  return (
    <button
      type="button"
      onClick={onClear}
      disabled={disabled || pending}
      className="self-start rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
    >
      Clear completed
    </button>
  );
}
