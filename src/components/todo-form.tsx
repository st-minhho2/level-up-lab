'use client';

// §7 TodoForm; §10: after a `form` failure the box keeps the typed title; §18: the title counter under the box.
import { useActionState, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createTodoAction } from '@/actions/todos';
import { titleCounterText } from '@/lib/title-count';

export function TodoForm(): ReactNode {
  const [state, formAction, pending] = useActionState(createTodoAction, null);
  const [draft, setDraft] = useState('');
  const box = useRef<HTMLInputElement>(null);
  const error = state !== null && !state.ok ? (state.fieldErrors.title?.[0] ?? state.fieldErrors.form?.[0]) : undefined;
  // React resets the form after the action; the reset lands on defaultValue, so it must already hold the draft
  // (no client wrapper around the action: it would drop the server-rendered native POST). Three writers keep the
  // draft equal to the box: onSubmit seeds it from the submitted form, for text that reached the box without a
  // change event (typed before hydration, set by an extension); onChange follows text typed while the save is
  // pending, which the submitted form does not hold; the layout effect below follows the reset itself.
  const kept = state !== null && !state.ok && state.fieldErrors.form !== undefined ? draft : '';

  // §18 REQ-18.6, REQ-18.7: React resets the form at the end of the commit that settles the action, before layout
  // effects run, and that reset fires no change event; re-reading the box after every commit keeps the counter on the
  // value the box holds. No dependency list on purpose; an unchanged value makes setDraft bail out.
  useLayoutEffect(() => {
    if (box.current !== null) {
      setDraft(box.current.value);
    }
  });

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
          ref={box}
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
          aria-describedby={error !== undefined ? 'new-todo-error new-todo-count' : 'new-todo-count'}
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
      <p id="new-todo-count" className="text-sm text-zinc-500">
        {titleCounterText(draft)}
      </p>
      {error !== undefined && (
        <p id="new-todo-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
