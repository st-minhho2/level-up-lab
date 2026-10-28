import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoForm } from './todo-form';

const actions = vi.hoisted(() => ({ createTodoAction: vi.fn(), toggleTodoAction: vi.fn() }));
vi.mock('@/actions/todos', () => actions);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoForm>', () => {
  it('AC-7: renders a text box labelled "New todo" and a button "Add"', () => {
    render(<TodoForm />);

    expect(screen.getByRole('textbox', { name: 'New todo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('AC-3: shows the title field error returned by the action', async () => {
    actions.createTodoAction.mockResolvedValue({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
  });

  it('AC-2: submits the typed title and clears the box on success', async () => {
    actions.createTodoAction.mockResolvedValue({
      ok: true,
      data: { id: 't1', title: 'Buy milk', completed: false, createdAt: new Date() },
    });
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.type(screen.getByRole('textbox', { name: 'New todo' }), 'Buy milk');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
    const formData = actions.createTodoAction.mock.calls[0]?.[1] as FormData;
    expect(formData.get('title')).toBe('Buy milk');
    expect(await screen.findByRole('textbox', { name: 'New todo' })).toHaveValue('');
  });
});
