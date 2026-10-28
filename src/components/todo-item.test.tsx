import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoItem } from './todo-item';

const actions = vi.hoisted(() => ({ createTodoAction: vi.fn(), toggleTodoAction: vi.fn() }));
vi.mock('@/actions/todos', () => actions);

function todo(completed: boolean) {
  return { id: 'todo-9', title: 'Walk the dog', completed, createdAt: new Date(2026, 0, 1) };
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
  it.todo('AC-6.1: shows one text field named "Edit title" with the current title');
  it.todo('AC-6.2: submits the draft to updateTodoTitleAction and leaves edit mode');
  it.todo('AC-6.4: keeps the draft and shows the error when the action rejects the title');
});
