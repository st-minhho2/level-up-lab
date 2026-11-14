import { act, createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

function failed(field: string, message: string): ActionResult<Todo> {
  return { ok: false, fieldErrors: { [field]: [message] } };
}

function deferred<T>(): { readonly promise: Promise<T>; readonly resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function dueDateField(): HTMLElement {
  return screen.getByLabelText('Due date');
}

function clearButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Clear due date' });
}

function updateButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Update due date' });
}

// A cancelable keydown dispatched through React's act, returned so the test can read defaultPrevented.
function pressKey(target: Element, init: KeyboardEventInit): Event {
  const event = createEvent.keyDown(target, { bubbles: true, cancelable: true, ...init });
  fireEvent(target, event);
  return event;
}

// Opens the editor and sets the field to 2026-12-01 without saving.
async function openEditorWithDraft(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Edit due date' }));
  fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('<TodoDueDate> "Clear due date" button (§40)', () => {
  it.each<{ readonly name: string; readonly dueDate: string | undefined }>([
    { name: '(a) stored 2026-11-05', dueDate: '2026-11-05' },
    { name: '(b) no stored date', dueDate: undefined },
  ])(
    'AC-40.1: $name: 0 "Clear due date" buttons before "Edit due date"; after it the form holds exactly 5 children in order: label "Due date", date input, "Today", button "Clear due date" (type button, text "Clear due date", no aria-label or title), "Update due date"; 1 "Due date" label and 0 buttons named "Clear"',
    async ({ dueDate }) => {
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate={dueDate} />);
      const clearButtonsBefore = screen.queryAllByRole('button', { name: 'Clear due date' }).length;

      await user.click(screen.getByRole('button', { name: 'Edit due date' }));

      expect(clearButtonsBefore).toBe(0);
      const form = dueDateField().closest('form');
      expect(form).not.toBeNull();
      const children = Array.from(form?.children ?? []);
      expect(children).toHaveLength(5);
      const [label, input, today, clear, update] = children;
      expect(label?.tagName).toBe('LABEL');
      expect(label?.textContent).toBe('Due date');
      expect(input?.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'date');
      expect(today).toBe(screen.getByRole('button', { name: 'Today' }));
      expect(clear).toBe(clearButton());
      expect(clear?.tagName).toBe('BUTTON');
      expect(clear).toHaveAttribute('type', 'button');
      expect(clear?.textContent).toBe('Clear due date');
      expect(clear).not.toHaveAttribute('aria-label');
      expect(clear).not.toHaveAttribute('title');
      expect(update).toBe(updateButton());
      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(screen.queryAllByRole('button', { name: 'Clear' })).toHaveLength(0);
    },
  );

  it.each<{ readonly name: string; readonly dueDate: string | undefined }>([
    { name: '(a) stored 2026-11-05', dueDate: '2026-11-05' },
    { name: '(b) no stored date', dueDate: undefined },
  ])(
    'AC-40.2: $name: after typing 2026-12-01, clicking "Clear due date" calls setTodoDueDateAction exactly once with (todo-9, ""), then shows 0 "Due date" fields, 0 alerts and 1 button "Edit due date"; never called with 2026-12-01',
    async ({ dueDate }) => {
      actions.setTodoDueDateAction.mockResolvedValue(saved(undefined));
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate={dueDate} />);
      await openEditorWithDraft(user);

      await user.click(clearButton());

      await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
      expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '']]);
      expect(screen.queryAllByRole('alert')).toHaveLength(0);
      expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
      expect(actions.setTodoDueDateAction).not.toHaveBeenCalledWith('todo-9', '2026-12-01');
    },
  );

  it.each<{ readonly name: string; readonly field: string; readonly message: string }>([
    { name: '(a) dueDate rejection', field: 'dueDate', message: 'Due date must be a valid date' },
    { name: '(b) failed save', field: 'form', message: 'Could not save, try again' },
  ])(
    'AC-40.3: $name: the first click shows exactly 1 alert $message in the wrapper with the field still holding 2026-12-01; the second click (ok) leaves 0 alerts and 0 "Due date" fields; the action called twice with (todo-9, "")',
    async ({ field, message }) => {
      actions.setTodoDueDateAction
        .mockResolvedValueOnce(failed(field, message))
        .mockResolvedValueOnce(saved(undefined));
      const user = userEvent.setup();
      const { container } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await openEditorWithDraft(user);

      await user.click(clearButton());

      await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
      const wrapper = container.firstElementChild;
      const alert = screen.getByRole('alert');
      expect(wrapper?.contains(alert)).toBe(true);
      expect(alert.textContent).toBe(message);
      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(dueDateField()).toHaveValue('2026-12-01');

      await user.click(clearButton());

      await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
      expect(screen.queryAllByRole('alert')).toHaveLength(0);
      expect(actions.setTodoDueDateAction.mock.calls).toEqual([
        ['todo-9', ''],
        ['todo-9', ''],
      ]);
    },
  );

  it.each<{ readonly name: string; readonly start: () => HTMLElement }>([
    { name: '(a) a save started by "Clear due date"', start: clearButton },
    { name: '(b) a save started by "Update due date" at 2026-12-01', start: updateButton },
  ])(
    'AC-40.4: $name: while pending "Clear due date", "Today" and "Update due date" are each disabled and the action was called once; after it resolves ok 0 "Due date" fields',
    async ({ start }) => {
      const save = deferred<ActionResult<Todo>>();
      actions.setTodoDueDateAction.mockReturnValue(save.promise);
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await openEditorWithDraft(user);

      await user.click(start());

      await waitFor(() => expect(clearButton()).toBeDisabled());
      expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
      expect(updateButton()).toBeDisabled();
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);

      await act(async () => {
        save.resolve(saved(undefined));
        await save.promise;
      });

      await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
    },
  );

  it('AC-40.5: (a) Escape on the focused "Clear due date" after a rejected save leaves 0 "Due date" fields, 0 alerts, "Due 2026-11-05" exactly once, 1 "Edit due date", defaultPrevented true and the action called exactly once', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(failed('dueDate', 'Due date must be a valid date'));
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(updateButton());
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    expect(dueDateField()).toHaveValue('2026-12-01');
    const clear = clearButton();
    act(() => clear.focus());
    expect(clear).toHaveFocus();

    const escape = pressKey(clear, { key: 'Escape' });

    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(screen.getAllByText('Due 2026-11-05')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
    expect(escape.defaultPrevented).toBe(true);
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);
  });

  it('AC-40.5: (b) Escape on "Clear due date" while a save is in flight keeps the field holding 2026-12-01 with defaultPrevented false', async () => {
    const save = deferred<ActionResult<Todo>>();
    actions.setTodoDueDateAction.mockReturnValue(save.promise);
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(updateButton());
    await waitFor(() => expect(updateButton()).toBeDisabled());

    const escape = pressKey(clearButton(), { key: 'Escape' });

    expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
    expect(dueDateField()).toHaveValue('2026-12-01');
    expect(escape.defaultPrevented).toBe(false);

    await act(async () => {
      save.resolve(saved('2026-12-01'));
      await save.promise;
    });
  });

  it.each<{ readonly name: string; readonly init: KeyboardEventInit }>([
    { name: 'Ctrl+Escape', init: { key: 'Escape', ctrlKey: true } },
    { name: 'Meta+Escape', init: { key: 'Escape', metaKey: true } },
    { name: 'Alt+Escape', init: { key: 'Escape', altKey: true } },
    { name: 'Shift+Escape', init: { key: 'Escape', shiftKey: true } },
    { name: 'ArrowLeft', init: { key: 'ArrowLeft' } },
  ])(
    'AC-40.5: (c) $name on "Clear due date" keeps the field with value 2026-12-01, defaultPrevented false and the action not called',
    async ({ init }) => {
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await openEditorWithDraft(user);

      const event = pressKey(clearButton(), init);

      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(dueDateField()).toHaveValue('2026-12-01');
      expect(event.defaultPrevented).toBe(false);
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
    },
  );
});
