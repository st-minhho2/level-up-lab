import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import type { Todo } from '@/lib/todos';
import { TodoDueDate } from './todo-due-date';

const actions = vi.hoisted(() => ({
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);

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
