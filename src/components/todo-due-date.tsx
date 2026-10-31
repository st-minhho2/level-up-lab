'use client';

// §15 TodoDueDate: a todo's due-date text and its edit control, rendered inside the TodoItem row.
import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { setTodoDueDateAction } from '@/actions/todos';

export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const fieldId = `todo-${todoId}-due-date`;
  const errorId = `${fieldId}-error`;

  function onEdit(): void {
    setDraft(dueDate ?? '');
    setEditing(true);
  }

  // The draft is sent as typed ('' clears); a rejection or a failed save keeps the field open with it (REQ-15.7,
  // REQ-15.10) and the next success removes the message (REQ-15.11).
  function onSave(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await setTodoDueDateAction(todoId, draft);
      if (result.ok) {
        setEditing(false);
        setError(undefined);
        return;
      }
      setError(result.fieldErrors.dueDate?.[0] ?? result.fieldErrors.id?.[0] ?? result.fieldErrors.form?.[0]);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <form onSubmit={onSave} className="flex items-center gap-2">
          <label htmlFor={fieldId} className="sr-only">
            Due date
          </label>
          <input
            id={fieldId}
            type="date"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={error !== undefined}
            aria-describedby={error !== undefined ? errorId : undefined}
            className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-zinc-900 px-3 py-1 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Update due date
          </button>
        </form>
      ) : (
        <>
          {dueDate !== undefined && <span className="text-sm text-zinc-500">Due {dueDate}</span>}
          {/* Icon only: a row without a due date must show no text beyond §5 and §6 (REQ-15.5). */}
          <button
            type="button"
            onClick={onEdit}
            disabled={pending}
            aria-label="Edit due date"
            title="Edit due date"
            className="rounded p-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" />
            </svg>
          </button>
        </>
      )}
      {error !== undefined && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
