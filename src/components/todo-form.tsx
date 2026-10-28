'use client';

// §7 TodoForm.
import { useActionState, type ReactNode } from 'react';
import { createTodoAction } from '@/actions/todos';

export function TodoForm(): ReactNode {
  const [state, formAction, pending] = useActionState(createTodoAction, null);
  const error = state !== null && !state.ok ? state.fieldErrors.title?.[0] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor="new-todo" className="sr-only">
          New todo
        </label>
        <input
          id="new-todo"
          name="title"
          type="text"
          placeholder="What needs doing?"
          maxLength={200}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? 'new-todo-error' : undefined}
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </div>
      {error !== undefined && (
        <p id="new-todo-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
