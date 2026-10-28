import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoItem } from './todo-item';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);

function todo(completed: boolean) {
  return { id: 'todo-9', title: 'Walk the dog', completed, createdAt: new Date(2026, 0, 1) };
}

function mistyped() {
  return { id: 'todo-9', title: 'Buy mik', completed: false, createdAt: new Date(2026, 0, 1) };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoItem>', () => {
  it('AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed', () => {
    render(<TodoItem todo={todo(false)} />);

    expect(screen.getByRole('checkbox', { name: 'Walk the dog' })).not.toBeChecked();
  });

  it('AC-5.4: renders a checked checkbox when completed and calls toggleTodoAction with the id on click', async () => {
    actions.toggleTodoAction.mockResolvedValue({ ok: true, data: todo(false) });
    const user = userEvent.setup();
    render(<TodoItem todo={todo(true)} />);

    const box = screen.getByRole('checkbox', { name: 'Walk the dog' });
    expect(box).toBeChecked();
    await user.click(box);

    expect(actions.toggleTodoAction).toHaveBeenCalledWith('todo-9');
  });

  it('AC-5.5: shows "Todo not found" when the action reports the id error', async () => {
    actions.toggleTodoAction.mockResolvedValue({ ok: false, fieldErrors: { id: ['Todo not found'] } });
    const user = userEvent.setup();
    render(<TodoItem todo={todo(false)} />);

    await user.click(screen.getByRole('checkbox', { name: 'Walk the dog' }));

    expect(await screen.findByText('Todo not found')).toBeInTheDocument();
  });
});

describe('<TodoItem> edit mode (§6)', () => {
  it('AC-6.1: shows one text field named "Edit title" with the current title', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    // Idle row text is exactly the title: e2e AC-5.1 compares each <li>'s whole text, so the edit control adds none.
    expect(screen.getByRole('listitem')).toHaveTextContent(/^Buy mik$/);

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy mik');
  });

  it('AC-6.2: submits the draft to updateTodoTitleAction and leaves edit mode', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: true, data: { ...mistyped(), title: 'Buy milk' } });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, '  Buy milk  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
    expect(actions.updateTodoTitleAction).toHaveBeenCalledWith('todo-9', '  Buy milk  ');
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('AC-6.4: keeps the draft and shows the error when the action rejects the title', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(actions.updateTodoTitleAction).toHaveBeenCalledWith('todo-9', '   ');
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('   ');
  });

  it('AC-6.5: shows "Title must be 200 characters or fewer" and keeps the draft when the action rejects the length', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({
      ok: false,
      fieldErrors: { title: ['Title must be 200 characters or fewer'] },
    });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Title must be 200 characters or fewer')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy mik');
  });
});
