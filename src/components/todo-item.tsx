'use client';

// §7 TodoItem, with the §6 edit mode and the §10 message of a failed toggle or save.
import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { toggleTodoAction, updateTodoTitleAction } from '@/actions/todos';
import { TodoDueDate } from '@/components/todo-due-date';
import type { Todo } from '@/lib/todos';

export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const checkboxId = `todo-${todo.id}`;
  const fieldId = `${checkboxId}-title`;
  const errorId = `${checkboxId}-error`;

  // A failed result carries exactly one of these keys (§5 `id`, §10 `form`); a success clears the row's message (REQ-10.5).
  function onToggle(): void {
    startTransition(async () => {
      const result = await toggleTodoAction(todo.id);
      setError(result.ok ? undefined : (result.fieldErrors.id?.[0] ?? result.fieldErrors.form?.[0]));
    });
  }

  function onEdit(): void {
    setDraft(todo.title);
    setEditing(true);
  }

  // The action trims and validates; the draft is sent as typed so the field can keep it on a rejection (AC-6.4) or a
  // failed save (REQ-10.3), which both leave the row in edit mode.
  function onSave(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateTodoTitleAction(todo.id, draft);
      if (result.ok) {
        setEditing(false);
        setError(undefined);
        return;
      }
      setError(result.fieldErrors.title?.[0] ?? result.fieldErrors.id?.[0] ?? result.fieldErrors.form?.[0]);
    });
  }

  return (
    <li className="flex items-center gap-3 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <input
        id={checkboxId}
        type="checkbox"
        checked={todo.completed}
        onChange={onToggle}
        disabled={pending}
        // The visible label is swapped for the text field while editing; the name must survive the swap.
        aria-label={editing ? todo.title : undefined}
      />
      {editing ? (
        <form onSubmit={onSave} className="flex flex-1 items-center gap-2">
          <label htmlFor={fieldId} className="sr-only">
            Edit title
          </label>
          <input
            id={fieldId}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-invalid={error !== undefined}
            aria-describedby={error !== undefined ? errorId : undefined}
            className="flex-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-zinc-900 px-3 py-1 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
        </form>
      ) : (
        <>
          <label htmlFor={checkboxId} className={todo.completed ? 'text-zinc-500 line-through' : ''}>
            {todo.title}
          </label>
          {/* Icon only: the row's idle text must stay exactly the title (AC-5.1 compares whole-row text). */}
          <button
            type="button"
            onClick={onEdit}
            disabled={pending}
            aria-label="Edit title"
            title="Edit title"
            className="rounded p-1 text-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:hover:text-zinc-100"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
            </svg>
          </button>
        </>
      )}
      <TodoDueDate todoId={todo.id} dueDate={todo.dueDate} />
      {error !== undefined && (
        <span id={errorId} role="alert" className="ml-auto text-sm text-red-600">
          {error}
        </span>
      )}
    </li>
  );
}
