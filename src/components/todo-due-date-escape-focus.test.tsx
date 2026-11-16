import { act, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import type { Todo } from '@/lib/todos';
import { TodoDueDate } from './todo-due-date';

const actions = vi.hoisted(() => ({
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);

function todo(dueDate: string | undefined): Todo {
  return { id: 'todo-9', title: 'Walk the dog', completed: false, createdAt: new Date(2026, 0, 1), dueDate };
}

function saved(dueDate: string | undefined): ActionResult<Todo> {
  return { ok: true, data: todo(dueDate) };
}

// A promise the test settles by hand, so the save stays in flight until then.
function deferred<T>(): { readonly promise: Promise<T>; readonly resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function dueDateField(): HTMLInputElement {
  const field = screen.getByLabelText('Due date');
  if (!(field instanceof HTMLInputElement)) {
    throw new Error('"Due date" is not an input');
  }
  return field;
}

function button(name: string): HTMLElement {
  return screen.getByRole('button', { name });
}

// A cancelable keydown dispatched through React's act, returned so the test can read defaultPrevented.
function pressKey(target: Element, init: KeyboardEventInit): Event {
  const event = createEvent.keyDown(target, { bubbles: true, cancelable: true, ...init });
  fireEvent(target, event);
  return event;
}

// Counts the focus() calls whose receiver is `element`.
function focusCallsOn(spy: MockInstance, element: Element): number {
  return spy.mock.contexts.filter((receiver) => receiver === element).length;
}

// Counts the focus() calls, from the `from`-th on, whose receiver is a button named "Edit due date".
function focusCallsOnEditButtons(spy: MockInstance, from: number): number {
  return spy.mock.contexts
    .slice(from)
    .filter(
      (receiver) => receiver instanceof HTMLButtonElement && receiver.getAttribute('aria-label') === 'Edit due date',
    ).length;
}

// The text boxes are plain elements beside the wrapper, so focus has somewhere else to go.
function besideBoxes(): ReactNode {
  return (
    <>
      <input type="text" aria-label="Search todos" />
      <input type="text" aria-label="New todo" />
      <TodoDueDate todoId="todo-9" dueDate="2026-11-05" />
    </>
  );
}

// Opens the editor and sets the field to 2026-12-01 without saving.
async function openEditorWithDraft(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(button('Edit due date'));
  fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('<TodoDueDate> Escape puts focus on "Edit due date" (§51)', () => {
  it('AC-51.3: after the Escape the field still holds 2026-12-01, defaultPrevented false and 0 focus() calls on "Edit due date"; after the save resolves 0 "Due date" fields, 1 "Edit due date" that is not document.activeElement and 0 focus() calls on it; setTodoDueDateAction called once', async () => {
    const save = deferred<ActionResult<Todo>>();
    actions.setTodoDueDateAction.mockReturnValue(save.promise);
    const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus');
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(button('Update due date'));
    await waitFor(() => expect(button('Update due date')).toBeDisabled());
    const callsBeforeEscape = focusSpy.mock.calls.length;

    const escape = pressKey(dueDateField(), { key: 'Escape' });

    expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
    expect(dueDateField()).toHaveValue('2026-12-01');
    expect(escape.defaultPrevented).toBe(false);
    expect(focusCallsOnEditButtons(focusSpy, callsBeforeEscape)).toBe(0);

    await act(async () => {
      save.resolve(saved('2026-12-01'));
      await save.promise;
    });
    await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));

    expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
    expect(document.activeElement).not.toBe(button('Edit due date'));
    expect(focusCallsOn(focusSpy, button('Edit due date'))).toBe(0);
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);
  });

  it.each<{
    readonly name: string;
    readonly start: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    readonly sent: readonly [string, string];
  }>([
    {
      name: '(a) "Update due date" with 2026-12-01',
      start: async (user) => {
        await openEditorWithDraft(user);
        await user.click(button('Update due date'));
      },
      sent: ['todo-9', '2026-12-01'],
    },
    {
      name: '(b) "Clear due date"',
      start: async (user) => {
        await user.click(button('Edit due date'));
        await user.click(button('Clear due date'));
      },
      sent: ['todo-9', ''],
    },
  ])(
    'AC-51.4: $name, after the save resolves ok 0 "Due date" fields, 1 "Edit due date", "Search todos" is document.activeElement with value milk and 0 focus() calls on the button; setTodoDueDateAction called once with the sent value',
    async ({ start, sent }) => {
      const save = deferred<ActionResult<Todo>>();
      actions.setTodoDueDateAction.mockReturnValue(save.promise);
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus');
      const user = userEvent.setup();
      render(besideBoxes());
      await start(user);
      await waitFor(() => expect(button('Update due date')).toBeDisabled());
      const search = screen.getByRole('textbox', { name: 'Search todos' });
      await user.click(search);
      await user.type(search, 'milk');

      await act(async () => {
        save.resolve(saved(sent[1] === '' ? undefined : sent[1]));
        await save.promise;
      });
      await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));

      expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
      expect(document.activeElement).toBe(search);
      expect(search).toHaveValue('milk');
      expect(focusCallsOn(focusSpy, button('Edit due date'))).toBe(0);
      expect(actions.setTodoDueDateAction.mock.calls).toEqual([sent]);
    },
  );

  it('AC-51.5: for Ctrl+, Meta+, Alt+, Shift+Escape and ArrowLeft in the field and Escape on body, "Update due date" and "New todo" the field still holds 2026-12-01, defaultPrevented false, the action not called, focus unchanged and the 5 form children of AC-37.1 in order; 0 "Edit due date" buttons and 0 focus() calls', async () => {
    const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus');
    const user = userEvent.setup();
    render(besideBoxes());
    await openEditorWithDraft(user);
    const presses: readonly { readonly target: () => Element; readonly init: KeyboardEventInit }[] = [
      { target: () => dueDateField(), init: { key: 'Escape', ctrlKey: true } },
      { target: () => dueDateField(), init: { key: 'Escape', metaKey: true } },
      { target: () => dueDateField(), init: { key: 'Escape', altKey: true } },
      { target: () => dueDateField(), init: { key: 'Escape', shiftKey: true } },
      { target: () => dueDateField(), init: { key: 'ArrowLeft' } },
      { target: () => document.body, init: { key: 'Escape' } },
      { target: () => button('Update due date'), init: { key: 'Escape' } },
      { target: () => screen.getByRole('textbox', { name: 'New todo' }), init: { key: 'Escape' } },
    ];
    const callsBeforePresses = focusSpy.mock.calls.length;

    for (const press of presses) {
      const activeBefore = document.activeElement;

      const event = pressKey(press.target(), press.init);

      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(dueDateField()).toHaveValue('2026-12-01');
      expect(event.defaultPrevented).toBe(false);
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
      expect(document.activeElement).toBe(activeBefore);
      const formChildren = Array.from(dueDateField().closest('form')?.children ?? []);
      expect(formChildren.map((child) => child.tagName)).toEqual(['LABEL', 'INPUT', 'BUTTON', 'BUTTON', 'BUTTON']);
      expect(formChildren.map((child) => child.textContent)).toEqual([
        'Due date',
        '',
        'Today',
        'Clear due date',
        'Update due date',
      ]);
    }

    expect(screen.queryAllByRole('button', { name: 'Edit due date' })).toHaveLength(0);
    expect(focusSpy.mock.calls.length - callsBeforePresses).toBe(0);
  });
});
