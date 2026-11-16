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
  it('AC-41.1: no focus and 0 text boxes after the render; after "Edit title" the field is document.activeElement with selection 0 to 7; updateTodoTitleAction called 0 times', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Buy mik')} />);

    expect(document.activeElement).toBe(document.body);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(document.activeElement).toBe(titleField());
    expect(titleField().selectionStart).toBe(0);
    expect(titleField().selectionEnd).toBe(7);
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(0);
  });

  it('AC-41.2: the field holds "Café 😀", is document.activeElement, selectionStart 0 and selectionEnd 7', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Café 😀')} />);

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(titleField()).toHaveValue('Café 😀');
    expect(document.activeElement).toBe(titleField());
    expect(titleField().selectionStart).toBe(0);
    expect(titleField().selectionEnd).toBe(7);
  });

  it('AC-41.3 (a): after Escape and "Edit title" again the field holds "Buy mik", is document.activeElement, selection 0 to 7', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Buy mik')} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');
    titleField().setSelectionRange(2, 4);
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(titleField()).toHaveValue('Buy mik');
    expect(document.activeElement).toBe(titleField());
    expect(titleField().selectionStart).toBe(0);
    expect(titleField().selectionEnd).toBe(7);
  });

  it('AC-41.3 (b): after a successful save and "Edit title" again the field holds "Buy milk", is document.activeElement, selection 0 to 8', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: true, data: openTodo('Buy milk') });
    const user = userEvent.setup();
    const { rerender } = render(<TodoItem todo={openTodo('Buy mik')} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');
    titleField().setSelectionRange(2, 4);
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryAllByRole('textbox')).toHaveLength(0));
    rerender(<TodoItem todo={openTodo('Buy milk')} />);

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(titleField()).toHaveValue('Buy milk');
    expect(document.activeElement).toBe(titleField());
    expect(titleField().selectionStart).toBe(0);
    expect(titleField().selectionEnd).toBe(8);
  });

  it('AC-41.5: typing "Z" replaces the selected title (caret 1), "a" gives "Za" (caret 2), ArrowLeft puts the caret at 1, never all selected again, row text outside the field unchanged', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Buy mik')} />);
    const row = screen.getByRole('listitem');
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const rowText = row.textContent;

    await user.keyboard('Z');

    expect(titleField()).toHaveValue('Z');
    expect(titleField().selectionStart).toBe(1);
    expect(titleField().selectionEnd).toBe(1);

    await user.keyboard('a');

    expect(titleField()).toHaveValue('Za');
    expect(titleField().selectionStart).toBe(2);
    expect(titleField().selectionEnd).toBe(2);

    await user.keyboard('{ArrowLeft}');

    expect(titleField()).toHaveValue('Za');
    expect(titleField().selectionStart).toBe(1);
    expect(titleField().selectionEnd).toBe(1);
    expect(row.textContent).toBe(rowText);
  });

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
