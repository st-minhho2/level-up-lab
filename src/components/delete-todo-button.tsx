'use client';

// §19 DeleteTodoButton; §10 the message of a failed delete, directly after the button inside the row.
import { useState, useTransition, type ReactNode } from 'react';
import { deleteTodoAction } from '@/actions/delete-todo';

export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  // One activation deletes, no confirmation (REQ-19.5). A failed result carries exactly one of these keys (§5 `id`,
  // §10 `form`); the next success clears the message (REQ-19.11).
  function onDelete(): void {
    startTransition(async () => {
      const result = await deleteTodoAction(todoId);
      setError(result.ok ? undefined : (result.fieldErrors.id?.[0] ?? result.fieldErrors.form?.[0]));
    });
  }

  // One wrapper so the message is the button's next sibling (REQ-19.10); icon only, so the row's idle text stays
  // exactly the title (REQ-19.3).
  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        aria-label="Delete todo"
        title="Delete todo"
        className="rounded p-1 text-zinc-500 hover:text-red-600 disabled:opacity-50"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {error !== undefined && (
        <span role="alert" className="text-sm text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
