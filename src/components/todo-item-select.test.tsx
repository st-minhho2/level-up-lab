import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoItem } from './todo-item';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);
// §19: TodoItem renders DeleteTodoButton, which imports this module; mocked at the boundary like '@/actions/todos'.
const deleteActions = vi.hoisted(() => ({
  deleteTodoAction: vi.fn(),
}));
vi.mock('@/actions/delete-todo', () => deleteActions);

// §41: a fresh object each call, so a re-render with it is "a new todo prop".
function openTodo(title: string) {
  return { id: 'todo-9', title, completed: false, createdAt: new Date(2026, 0, 1) };
}

// §10: the one failure result a mutation can report besides its own field errors.
function saveFailed() {
  return { ok: false as const, fieldErrors: { form: ['Could not save, try again'] } };
}

function titleField(): HTMLInputElement {
  const field = screen.getByRole('textbox', { name: 'Edit title' });
  if (!(field instanceof HTMLInputElement)) {
    throw new Error('the "Edit title" text box is not an <input>');
  }
  return field;
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<TodoItem> selects the title on entering edit mode (§41)', () => {
  it.each([
    {
      name: '(a) rejected',
      result: { ok: false as const, fieldErrors: { title: ['Title is required'] } },
      message: 'Title is required',
    },
    { name: '(b) saveFailed()', result: saveFailed(), message: 'Could not save, try again' },
  ])(
    'AC-41.4 $name: the field keeps "Buy milk" and the selection 2 to 4, exactly 1 alert with the action\'s message, focus moved to "Save" stays there, updateTodoTitleAction called once',
    async ({ result, message }) => {
      actions.updateTodoTitleAction.mockResolvedValue(result);
      const user = userEvent.setup();
      const { rerender } = render(<TodoItem todo={openTodo('Buy mik')} />);
      const row = screen.getByRole('listitem');
      await user.click(screen.getByRole('button', { name: 'Edit title' }));
      await user.clear(titleField());
      await user.type(titleField(), 'Buy milk');
      titleField().setSelectionRange(2, 4);

      await user.keyboard('{Enter}');
      await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(1));
      rerender(<TodoItem todo={openTodo('Buy mik')} />);

      expect(within(row).getByRole('alert').textContent).toBe(message);
      expect(titleField()).toHaveValue('Buy milk');
      expect(titleField().selectionStart).toBe(2);
      expect(titleField().selectionEnd).toBe(4);

      const save = screen.getByRole('button', { name: 'Save' });
      act(() => {
        save.focus();
      });
      await waitFor(() => expect(save).toBeEnabled());

      expect(document.activeElement).toBe(save);
      expect(titleField().selectionStart).toBe(2);
      expect(titleField().selectionEnd).toBe(4);
      expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
    },
  );
});
