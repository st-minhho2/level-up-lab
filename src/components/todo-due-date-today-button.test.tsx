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

function fieldValue(): string {
  const field = dueDateField();
  if (!(field instanceof HTMLInputElement)) {
    throw new Error('"Due date" is not an input');
  }
  return field.value;
}

function todayButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Today' });
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

describe('<TodoDueDate> "Today" button (§37)', () => {
  it('AC-37.1: shows 0 "Today" buttons before "Edit due date"; after it the form holds exactly 4 children in order: label "Due date", date input, button "Today" (type button, text "Today"), submit button "Update due date"', async () => {
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    const todayButtonsBefore = screen.queryAllByRole('button', { name: 'Today' }).length;

    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    expect(todayButtonsBefore).toBe(0);
    const form = dueDateField().closest('form');
    expect(form).not.toBeNull();
    const children = Array.from(form?.children ?? []);
    expect(children).toHaveLength(4);
    const [label, input, today, update] = children;
    expect(label?.tagName).toBe('LABEL');
    expect(label?.textContent).toBe('Due date');
    expect(input?.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'date');
    expect(today).toBe(todayButton());
    expect(today?.tagName).toBe('BUTTON');
    expect(today).toHaveAttribute('type', 'button');
    expect(today?.textContent).toBe('Today');
    expect(update).toBe(screen.getByRole('button', { name: 'Update due date' }));
    expect(update?.tagName).toBe('BUTTON');
    expect(update).toHaveAttribute('type', 'submit');
  });

  it.each<{ readonly name: string; readonly dueDate: string | undefined }>([
    { name: '(a) stored 2026-10-20', dueDate: '2026-10-20' },
    { name: '(b) no stored date', dueDate: undefined },
  ])(
    'AC-37.2: $name: "Today" sets the field to exactly 2026-11-01 with 1 "Due date" field, 0 alerts and the action called 0 times; "Update due date" then calls it once with (todo-9, 2026-11-01) and the field is gone',
    async ({ dueDate }) => {
      actions.setTodoDueDateAction.mockResolvedValue(saved('2026-11-01'));
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate={dueDate} />);
      await openEditorWithDraft(user);

      await user.click(todayButton());

      expect(dueDateField()).toHaveValue('2026-11-01');
      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(screen.queryAllByRole('alert')).toHaveLength(0);
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);

      await user.click(screen.getByRole('button', { name: 'Update due date' }));

      expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '2026-11-01']]);
      await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
    },
  );

  it('AC-37.3: "Today" reads the day at the click: 2026-11-02 after midnight (not 2026-11-01 read at mount), then 2026-01-05 zero-padded', async () => {
    vi.setSystemTime(new Date(2026, 10, 1, 23, 59, 58));
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-10-20" />);
    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    vi.setSystemTime(new Date(2026, 10, 2, 0, 0, 1));
    await user.click(todayButton());
    const afterMidnight = fieldValue();
    vi.setSystemTime(new Date(2026, 0, 5, 9, 0, 0));
    await user.click(todayButton());
    const inJanuary = fieldValue();

    expect([afterMidnight, inJanuary]).toEqual(['2026-11-02', '2026-01-05']);
  });

  it('AC-37.4: Escape on the focused "Today" after a rejected save leaves 0 "Due date" fields, 0 alerts, "Due 2026-11-05" exactly once, 1 "Edit due date", defaultPrevented true and the action called exactly once; the next edit opens on 2026-11-05', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(failed('dueDate', 'Due date must be a valid date'));
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(screen.getByRole('button', { name: 'Update due date' }));
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    expect(screen.getByRole('alert').textContent).toBe('Due date must be a valid date');
    const today = todayButton();
    act(() => today.focus());
    expect(today).toHaveFocus();

    const escape = pressKey(today, { key: 'Escape' });

    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(screen.getAllByText('Due 2026-11-05')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
    expect(escape.defaultPrevented).toBe(true);
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    expect(dueDateField()).toHaveValue('2026-11-05');
  });

  it('AC-37.5: (a) while the save of 2026-12-01 is in flight "Today" is disabled and Escape on it keeps the field holding 2026-12-01 with defaultPrevented false; after it resolves ok 0 "Due date" fields and the action called once', async () => {
    const save = deferred<ActionResult<Todo>>();
    actions.setTodoDueDateAction.mockReturnValue(save.promise);
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(screen.getByRole('button', { name: 'Update due date' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Update due date' })).toBeDisabled());

    const escape = pressKey(todayButton(), { key: 'Escape' });

    expect(todayButton()).toBeDisabled();
    expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
    expect(dueDateField()).toHaveValue('2026-12-01');
    expect(escape.defaultPrevented).toBe(false);

    await act(async () => {
      save.resolve(saved('2026-12-01'));
      await save.promise;
    });

    await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);
  });

  it.each<{ readonly name: string; readonly init: KeyboardEventInit }>([
    { name: 'Ctrl+Escape', init: { key: 'Escape', ctrlKey: true } },
    { name: 'Meta+Escape', init: { key: 'Escape', metaKey: true } },
    { name: 'Alt+Escape', init: { key: 'Escape', altKey: true } },
    { name: 'Shift+Escape', init: { key: 'Escape', shiftKey: true } },
    { name: 'ArrowLeft', init: { key: 'ArrowLeft' } },
  ])(
    'AC-37.5: (b) $name on "Today" keeps the field with value 2026-12-01, defaultPrevented false and the action not called',
    async ({ init }) => {
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await openEditorWithDraft(user);

      const event = pressKey(todayButton(), init);

      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(dueDateField()).toHaveValue('2026-12-01');
      expect(event.defaultPrevented).toBe(false);
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
    },
  );
});
