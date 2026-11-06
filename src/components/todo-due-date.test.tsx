import { act, createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

// The one element the component renders; the alert must live inside it (AC-15.6).
function wrapperOf(container: HTMLElement): HTMLElement {
  expect(container.children).toHaveLength(1);
  const wrapper = container.firstElementChild;
  if (!(wrapper instanceof HTMLElement)) {
    throw new Error('TodoDueDate rendered no wrapper element');
  }
  return wrapper;
}

function dueDateField(): HTMLElement {
  return screen.getByLabelText('Due date');
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoDueDate> (§15)', () => {
  it('AC-15.5: (a) with dueDate 2026-11-05 shows "Due 2026-11-05" exactly once, 1 button "Edit due date", no alert and no "Due date" field', () => {
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);

    expect(screen.getAllByText('Due 2026-11-05')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
  });

  it('AC-15.5: (b) with no dueDate the text content is exactly "", with 1 button "Edit due date", no alert and no "Due date" field', () => {
    const { container } = render(<TodoDueDate todoId="todo-9" dueDate={undefined} />);

    expect(container.textContent).toBe('');
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
  });

  it('AC-15.6: edits to 2026-12-01, shows exactly 1 alert "Could not save, try again" in the wrapper with the field kept, then on the next success removes it and leaves edit mode', async () => {
    actions.setTodoDueDateAction
      .mockResolvedValueOnce(failed('form', 'Could not save, try again'))
      .mockResolvedValueOnce(saved('2026-12-01'));
    const user = userEvent.setup();
    const { container } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);

    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
    expect(dueDateField()).toHaveValue('2026-11-05');
    expect(screen.getAllByRole('button', { name: 'Update due date' })).toHaveLength(1);

    fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
    await user.click(screen.getByRole('button', { name: 'Update due date' }));

    const wrapper = wrapperOf(container);
    await waitFor(() => expect(within(wrapper).queryAllByRole('alert')).toHaveLength(1));
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(within(wrapper).getByRole('alert').textContent).toBe('Could not save, try again');
    expect(dueDateField()).toHaveValue('2026-12-01');

    await user.click(screen.getByRole('button', { name: 'Update due date' }));

    expect(actions.setTodoDueDateAction.mock.calls).toEqual([
      ['todo-9', '2026-12-01'],
      ['todo-9', '2026-12-01'],
    ]);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0));
    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
  });

  it('AC-15.6: an empty field calls the action with (todo-9, ""), and the dueDate error shows exactly "Due date must be a valid date" with the field kept', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(failed('dueDate', 'Due date must be a valid date'));
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    fireEvent.change(dueDateField(), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'Update due date' }));

    expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '']]);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    expect(screen.getByRole('alert').textContent).toBe('Due date must be a valid date');
    expect(dueDateField()).toHaveValue('');
  });

  it('AC-15.6: with no due date the field opens empty, and the id error shows exactly "Todo not found"', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(failed('id', 'Todo not found'));
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate={undefined} />);

    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    expect(dueDateField()).toHaveValue('');

    fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
    await user.click(screen.getByRole('button', { name: 'Update due date' }));

    expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '2026-12-01']]);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    expect(screen.getByRole('alert').textContent).toBe('Todo not found');
  });
});

// A cancelable keydown dispatched through React's act, returned so the test can read defaultPrevented.
function pressKey(target: Element, init: KeyboardEventInit): Event {
  const event = createEvent.keyDown(target, { bubbles: true, cancelable: true, ...init });
  fireEvent(target, event);
  return event;
}

// Opens the editor on 2026-11-05 and sets the field to 2026-12-01 without saving.
async function openEditorWithDraft(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Edit due date' }));
  fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
}

function deferred<T>(): { readonly promise: Promise<T>; readonly resolve: (value: T) => void } {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

describe('<TodoDueDate> Escape in the due-date field (§28)', () => {
  it('AC-28.4: Escape while the save is in flight keeps the field holding 2026-12-01 with defaultPrevented false; after the save resolves ok 0 "Due date" fields and the action called exactly once', async () => {
    const save = deferred<ActionResult<Todo>>();
    actions.setTodoDueDateAction.mockReturnValue(save.promise);
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(screen.getByRole('button', { name: 'Update due date' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Update due date' })).toBeDisabled());

    const escape = pressKey(dueDateField(), { key: 'Escape' });

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

  it('AC-28.5: Enter in the field holding 2026-12-01 calls setTodoDueDateAction once with (todo-9, 2026-12-01)', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(saved('2026-12-01'));
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await openEditorWithDraft(user);
    await user.click(dueDateField());

    await user.keyboard('{Enter}');

    await waitFor(() => expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '2026-12-01']]));
  });

  it.each<{ readonly name: string; readonly init: KeyboardEventInit }>([
    { name: 'ArrowLeft', init: { key: 'ArrowLeft' } },
    { name: 'Ctrl+Escape', init: { key: 'Escape', ctrlKey: true } },
    { name: 'Meta+Escape', init: { key: 'Escape', metaKey: true } },
    { name: 'Alt+Escape', init: { key: 'Escape', altKey: true } },
    { name: 'Shift+Escape', init: { key: 'Escape', shiftKey: true } },
  ])(
    'AC-28.5: $name in the field keeps the field with value 2026-12-01, defaultPrevented false and the action not called',
    async ({ init }) => {
      const user = userEvent.setup();
      render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await openEditorWithDraft(user);

      const event = pressKey(dueDateField(), init);

      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(dueDateField()).toHaveValue('2026-12-01');
      expect(event.defaultPrevented).toBe(false);
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
    },
  );

  it.each<{ readonly name: string; readonly target: () => Element }>([
    { name: 'document.body', target: () => document.body },
    { name: 'the button "Update due date"', target: () => screen.getByRole('button', { name: 'Update due date' }) },
    { name: 'the text box "New todo"', target: () => screen.getByRole('textbox', { name: 'New todo' }) },
  ])(
    'AC-28.6: Escape on $name keeps the field with value 2026-12-01, defaultPrevented false and the action not called',
    async ({ target }) => {
      const user = userEvent.setup();
      render(
        <>
          <input type="text" aria-label="New todo" />
          <TodoDueDate todoId="todo-9" dueDate="2026-11-05" />
        </>,
      );
      await openEditorWithDraft(user);

      const event = pressKey(target(), { key: 'Escape' });

      expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
      expect(dueDateField()).toHaveValue('2026-12-01');
      expect(event.defaultPrevented).toBe(false);
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
    },
  );
});
