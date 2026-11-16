import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

function rejected(message: string): ActionResult<Todo> {
  return { ok: false, fieldErrors: { dueDate: [message] } };
}

// §10: the one failure result a mutation can report besides its own field errors.
function saveFailed(): ActionResult<Todo> {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
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

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 1, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('<TodoDueDate> focuses the date field on entering edit mode (§45)', () => {
  it('AC-45.1: after the render document.activeElement is body with 0 "Due date" fields; after "Edit due date" the field is document.activeElement with value 2026-11-05; setTodoDueDateAction called 0 times', async () => {
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);

    expect(document.activeElement).toBe(document.body);
    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);

    await user.click(button('Edit due date'));

    expect(document.activeElement).toBe(dueDateField());
    expect(dueDateField().value).toBe('2026-11-05');
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
  });

  it('AC-45.2: with no due date the field has value "" and is document.activeElement; setTodoDueDateAction called 0 times', async () => {
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate={undefined} />);

    await user.click(button('Edit due date'));

    expect(dueDateField().value).toBe('');
    expect(document.activeElement).toBe(dueDateField());
    expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(0);
  });

  it('AC-45.3: (a) after the Escape document.activeElement is the button "Edit due date"; after "Edit due date" again the field holds 2026-11-05 and is document.activeElement', async () => {
    const user = userEvent.setup();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await user.click(button('Edit due date'));
    fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
    fireEvent.keyDown(dueDateField(), { key: 'Escape' });

    expect(document.activeElement).toBe(button('Edit due date'));

    await user.click(button('Edit due date'));

    expect(dueDateField().value).toBe('2026-11-05');
    expect(document.activeElement).toBe(dueDateField());
  });

  it('AC-45.3: (b) after a successful save of 2026-12-01 and a re-render with it, "Edit due date" opens the field holding 2026-12-01 as document.activeElement', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(saved('2026-12-01'));
    const user = userEvent.setup();
    const { rerender } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    await user.click(button('Edit due date'));
    fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
    await user.click(button('Update due date'));
    await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-12-01" />);

    await user.click(button('Edit due date'));

    expect(dueDateField().value).toBe('2026-12-01');
    expect(document.activeElement).toBe(dueDateField());
  });

  it('AC-45.5: HTMLInputElement focus() is called 0 times after the render, exactly 1 after "Edit due date", still 1 after "Today" and the re-render; after Escape 0 "Due date" fields, document.activeElement is the button "Edit due date" and 1 call in all; the field\'s attributes and the 5 form children in order are those of §37', async () => {
    const focusSpy = vi.spyOn(HTMLInputElement.prototype, 'focus');
    const user = userEvent.setup();
    const { rerender } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
    const callsAfterRender = focusSpy.mock.calls.length;

    await user.click(button('Edit due date'));
    const callsAfterEdit = focusSpy.mock.calls.length;
    const field = dueDateField();
    const fieldAttributes = Array.from(field.attributes, (attribute) => attribute.name).sort();
    const form = field.closest('form');
    const formChildren = Array.from(form?.children ?? []);
    await user.click(button('Today'));
    const callsAfterToday = focusSpy.mock.calls.length;
    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-06" />);
    const callsAfterRerender = focusSpy.mock.calls.length;
    await user.keyboard('{Escape}');

    expect(callsAfterRender).toBe(0);
    expect(callsAfterEdit).toBe(1);
    expect(callsAfterToday).toBe(1);
    expect(callsAfterRerender).toBe(1);
    expect(screen.queryAllByLabelText('Due date')).toHaveLength(0);
    expect(document.activeElement).toBe(button('Edit due date'));
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(fieldAttributes).toEqual(['aria-invalid', 'class', 'id', 'type', 'value']);
    expect(field.id).toBe('todo-todo-9-due-date');
    expect(field).toHaveAttribute('type', 'date');
    expect(field).toHaveAttribute('aria-invalid', 'false');
    expect(formChildren.map((child) => child.tagName)).toEqual(['LABEL', 'INPUT', 'BUTTON', 'BUTTON', 'BUTTON']);
    expect(formChildren.map((child) => child.textContent)).toEqual([
      'Due date',
      '',
      'Today',
      'Clear due date',
      'Update due date',
    ]);
    expect(formChildren[1]).toBe(field);
    expect(formChildren.map((child) => child.getAttribute('type'))).toEqual([
      null,
      'date',
      'button',
      'button',
      'submit',
    ]);
  });

  it('AC-45.6: todo-9\'s field is document.activeElement while todo-8\'s wrapper still shows "Due 2026-11-09", 1 "Edit due date" and 0 "Due date" fields; Enter calls setTodoDueDateAction once with (todo-9, 2026-11-05)', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(saved('2026-11-05'));
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

    expect(document.activeElement).toBe(within(rowNine).getByLabelText('Due date'));
    expect(within(rowEight).getAllByText('Due 2026-11-09')).toHaveLength(1);
    expect(within(rowEight).getAllByRole('button', { name: 'Edit due date' })).toHaveLength(1);
    expect(within(rowEight).queryAllByLabelText('Due date')).toHaveLength(0);

    await user.keyboard('{Enter}');

    expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '2026-11-05']]);
  });

  it.each<{ readonly name: string; readonly result: ActionResult<Todo>; readonly message: string }>([
    {
      name: '(a) rejected',
      result: rejected('Due date must be a valid date'),
      message: 'Due date must be a valid date',
    },
    { name: '(b) saveFailed()', result: saveFailed(), message: 'Could not save, try again' },
  ])(
    'AC-45.4: $name, the field is still present with value 2026-12-01, exactly 1 alert with the action\'s message, and after the result and the re-render document.activeElement is "Update due date", not the field; setTodoDueDateAction called once',
    async ({ result, message }) => {
      actions.setTodoDueDateAction.mockResolvedValue(result);
      const user = userEvent.setup();
      const { rerender } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);
      await user.click(button('Edit due date'));
      fireEvent.change(dueDateField(), { target: { value: '2026-12-01' } });
      act(() => {
        button('Today').focus();
      });

      await user.click(button('Update due date'));
      await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
      await waitFor(() => expect(button('Update due date')).toBeEnabled());
      rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-05" />);

      expect(dueDateField()).toHaveValue('2026-12-01');
      expect(screen.getAllByRole('alert')).toHaveLength(1);
      expect(screen.getByRole('alert').textContent).toBe(message);
      expect(document.activeElement).toBe(button('Update due date'));
      expect(document.activeElement).not.toBe(dueDateField());
      expect(actions.setTodoDueDateAction).toHaveBeenCalledTimes(1);
    },
  );
});
