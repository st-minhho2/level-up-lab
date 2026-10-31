import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
