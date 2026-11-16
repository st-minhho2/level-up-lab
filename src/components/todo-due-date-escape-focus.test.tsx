import { act, createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  it('AC-51.1: after the Escape 0 "Due date" fields and the one "Edit due date" is document.activeElement with exactly 1 focus() call on it, still 1 and still active after the re-render; after Enter the field is document.activeElement with value 2026-11-06; setTodoDueDateAction called 0 times', async () => {
    const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus');
    const user = userEvent.setup();
    const { rerender } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    expect(document.activeElement).toBe(dueDateField());

    await user.keyboard('{Escape}');
    const editButtonsAfterEscape = screen.getAllByRole('button', { name: 'Edit due date' });
    const activeAfterEscape = document.activeElement;
    const callsAfterEscape = focusCallsOn(focusSpy, button('Edit due date'));
    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-06" />);
    const callsAfterRerender = focusCallsOn(focusSpy, button('Edit due date'));
    const activeAfterRerender = document.activeElement;

    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
    expect(editButtonsAfterEscape).toHaveLength(1);
    expect(activeAfterEscape).toBe(editButtonsAfterEscape[0]);
    expect(callsAfterEscape).toBe(1);
    expect(callsAfterRerender).toBe(1);
    expect(activeAfterRerender).toBe(button('Edit due date'));

    await user.keyboard('{Enter}');

    expect(document.activeElement).toBe(dueDateField());
    expect(dueDateField()).toHaveValue('2026-11-06');
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
  });

  it.each<{ readonly name: string; readonly control: string }>([
    { name: '(a) on "Today"', control: 'Today' },
    { name: '(b) on "Clear due date"', control: 'Clear due date' },
  ])(
    'AC-51.2: $name after a rejected save, 0 "Due date" fields, 0 alerts, "Due 2026-11-05" exactly once, defaultPrevented true and the one "Edit due date" is document.activeElement; setTodoDueDateAction called once; after "Edit due date" the field is document.activeElement with value 2026-11-05',
    async ({ control }) => {
      actions.setTodoDueDateAction.mockResolvedValue({
        ok: false,
        fieldErrors: { dueDate: ['Due date must be a valid date'] },
      });
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await openEditorWithDraft(user);
      await user.click(button('Update due date'));
      await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Due date must be a valid date'));
      await waitFor(() => expect(button('Update due date')).toBeEnabled());
      const target = button(control);
      act(() => target.focus());
      expect(document.activeElement).toBe(target);

      const escape = pressKey(target, { key: 'Escape' });

      expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
      expect(screen.queryAllByRole('alert')).toHaveLength(0);
      expect(screen.getAllByText('Due 2026-11-05')).toHaveLength(1);
      expect(escape.defaultPrevented).toBe(true);
      expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
      expect(document.activeElement).toBe(button('Edit due date'));
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);

      await user.click(button('Edit due date'));

      expect(document.activeElement).toBe(dueDateField());
      expect(dueDateField()).toHaveValue('2026-11-05');
    },
  );

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

  // The Escape's marker is one-shot (REQ-51.5): a later save or clear that ends a new edit moves no focus (REQ-51.3).
  it.each<{
    readonly name: string;
    readonly finish: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    readonly sent: readonly [string, string];
  }>([
    {
      name: '(a) "Update due date" with 2026-12-01',
      finish: async (user) => {
        fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
        await user.click(button('Update due date'));
      },
      sent: ['todo-9', '2026-12-01'],
    },
    {
      name: '(b) "Clear due date"',
      finish: async (user) => {
        await user.click(button('Clear due date'));
      },
      sent: ['todo-9', ''],
    },
  ])(
    'AC-51.3: after an Escape, a new entry and $name resolved ok, 0 "Due date" fields, 1 "Edit due date" that is not document.activeElement and 0 focus() calls on it, "Search todos" is document.activeElement with value milk; setTodoDueDateAction called once with the sent value',
    async ({ finish, sent }) => {
      const save = deferred<ActionResult<Todo>>();
      actions.setTodoDueDateAction.mockReturnValue(save.promise);
      const focusSpy = vi.spyOn(HTMLButtonElement.prototype, 'focus');
      const user = userEvent.setup();
      render(besideBoxes());
      await openEditorWithDraft(user);
      await user.keyboard('{Escape}');
      expect(document.activeElement).toBe(button('Edit due date'));
      await user.click(button('Edit due date'));
      await finish(user);
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
      expect(document.activeElement).not.toBe(button('Edit due date'));
      expect(focusCallsOn(focusSpy, button('Edit due date'))).toBe(0);
      expect(document.activeElement).toBe(search);
      expect(search).toHaveValue('milk');
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

  it('AC-51.6: after the Escape todo-9\'s "Edit due date" is document.activeElement and todo-8\'s is not; todo-8 still shows "Due 2026-11-09" and 0 "Due date" fields; input focus() called 1 time in all, select() and setSelectionRange() 0 times; setTodoDueDateAction called 0 times', async () => {
    const inputFocusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');
    const selectSpy = vi.spyOn(HTMLInputElement.prototype, 'select');
    const selectionRangeSpy = vi.spyOn(HTMLInputElement.prototype, 'setSelectionRange');
    const user = userEvent.setup();
    render(
      <ul>
        <li>
          <TodoDueDate todoId="todo-9" dueDate="2026-11-05" />
        </li>
        <li>
          <TodoDueDate todoId="todo-8" dueDate="2026-11-09" />
        </li>
      </ul>,
    );
    const [rowNine, rowEight] = screen.getAllByRole('listitem');
    if (rowNine === undefined || rowEight === undefined) {
      throw new Error('expected two rows');
    }
    await user.click(within(rowNine).getByRole('button', { name: 'Edit due date' }));

    await user.keyboard('{Escape}');

    expect(within(rowEight).getAllByText('Due 2026-11-09')).toHaveLength(1);
    expect(within(rowEight).queryAllByLabelText('Due date')).toHaveLength(0);
    expect(inputFocusSpy).toHaveBeenCalledTimes(1);
    expect(selectSpy).toHaveBeenCalledTimes(0);
    expect(selectionRangeSpy).toHaveBeenCalledTimes(0);
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
    const rowEightButtons = within(rowEight).getAllByRole('button', { name: 'Edit due date' });
    expect(rowEightButtons).toHaveLength(1);
    expect(document.activeElement).not.toBe(rowEightButtons[0]);
    expect(document.activeElement).toBe(within(rowNine).getByRole('button', { name: 'Edit due date' }));
  });
});
