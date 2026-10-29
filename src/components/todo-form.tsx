'use client';

// §7 TodoForm; §10: after a `form` failure the box keeps the typed title.
import { useActionState, useState, type ReactNode } from 'react';
import { createTodoAction } from '@/actions/todos';

export function TodoForm(): ReactNode {
  const [state, formAction, pending] = useActionState(createTodoAction, null);
  const [draft, setDraft] = useState('');
  const error = state !== null && !state.ok ? (state.fieldErrors.title?.[0] ?? state.fieldErrors.form?.[0]) : undefined;
  // React resets the form after the action; the reset lands on defaultValue, so it must already hold the draft
  // (no client wrapper around the action: it would drop the server-rendered native POST). Two writers keep the
  // draft equal to the box: onSubmit seeds it from the submitted form, for text that reached the box without a
  // change event (typed before hydration, set by an extension); onChange follows text typed while the save is
  // pending, which the submitted form does not hold.
  const kept = state !== null && !state.ok && state.fieldErrors.form !== undefined ? draft : '';

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const title = new FormData(event.currentTarget).get('title');
        setDraft(typeof title === 'string' ? title : '');
      }}
      className="flex flex-col gap-2"
    >
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
          defaultValue={kept}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
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
