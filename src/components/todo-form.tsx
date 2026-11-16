'use client';

// §7 TodoForm; §10: after a `form` failure the box keeps the typed title; §18: the title counter under the box;
// §29: Escape in the box empties it; §39: a near-limit warning after the counter, from the same draft;
// §44: after a successful add, focus returns to the box; §47: unless focus moved elsewhere while the save was pending.
import {
  useActionState,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createTodoAction } from '@/actions/todos';
import { isSearchEscape } from '@/lib/escape-search';
import { isTitleNearLimit, titleCounterText } from '@/lib/title-count';

export function TodoForm(): ReactNode {
  const [state, formAction, pending] = useActionState(createTodoAction, null);
  const [draft, setDraft] = useState('');
  const box = useRef<HTMLInputElement>(null);
  const error = state !== null && !state.ok ? (state.fieldErrors.title?.[0] ?? state.fieldErrors.form?.[0]) : undefined;
  // React resets the form after the action; the reset lands on defaultValue, so it must already hold the draft
  // (no client wrapper around the action: it would drop the server-rendered native POST). Four writers keep the
  // draft equal to the box: onSubmit seeds it from the submitted form, for text that reached the box without a
  // change event (typed before hydration, set by an extension); onChange follows text typed while the save is
  // pending, which the submitted form does not hold; the layout effect below follows the reset itself; onKeyDown
  // (§29) empties the box and the draft together on Escape.
  const kept = state !== null && !state.ok && state.fieldErrors.form !== undefined ? draft : '';

  // §18 REQ-18.6, REQ-18.7: React resets the form at the end of the commit that settles the action, before layout
  // effects run, and that reset fires no change event; re-reading the box after every commit keeps the counter on the
  // value the box holds. No dependency list on purpose; an unchanged value makes setDraft bail out.
  useLayoutEffect(() => {
    if (box.current !== null) {
      setDraft(box.current.value);
    }
  });

  // §44 REQ-44.1, REQ-44.4: focus follows each settled save, read from pending falling true → false, not from a
  // change of `state`: two ok results may be the same object, and each must focus the box once. REQ-44.2: the
  // first render and re-renders that do not settle a save leave pending unchanged, so focus is never touched;
  // REQ-44.3: a failed result calls no focus(). Declared after the draft sync, so the box is already empty.
  // §47 REQ-47.1..47.3: focus moves only if the person left it on the form or nowhere; read here, at the commit that
  // settles the result, so a move made and undone while pending counts as no move.
  const addButton = useRef<HTMLButtonElement>(null);
  const wasPending = useRef(false);
  useLayoutEffect(() => {
    if (wasPending.current && !pending && state?.ok === true) {
      const active = document.activeElement;
      if (active === null || active === document.body || active === box.current || active === addButton.current) {
        box.current?.focus();
      }
    }
    wasPending.current = pending;
  }, [pending, state]);

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
          onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>): void => {
            // §29 REQ-29.1, REQ-29.4: the native event, so a legacy `Esc` key is not Escape; while a save is pending
            // only its own result empties or refills the box (§18 REQ-18.7).
            if (pending || !isSearchEscape(event.nativeEvent)) {
              return;
            }
            event.preventDefault();
            // REQ-29.2: the box may hold text set without a change event, so it is emptied directly and the draft
            // follows it; the counter reads 0 / 200 within this key event.
            if (box.current !== null) {
              box.current.value = '';
            }
            setDraft('');
          }}
          aria-invalid={error !== undefined}
          aria-describedby={error !== undefined ? 'new-todo-error new-todo-count' : 'new-todo-count'}
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          ref={addButton}
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
      {isTitleNearLimit(draft) && (
        <p id="new-todo-warning" className="text-sm text-amber-700 dark:text-amber-400">
          Almost at the character limit
        </p>
      )}
      {error !== undefined && (
        <p id="new-todo-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
