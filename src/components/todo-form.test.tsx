import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoForm } from './todo-form';

const actions = vi.hoisted(() => ({ createTodoAction: vi.fn(), toggleTodoAction: vi.fn() }));
vi.mock('@/actions/todos', () => actions);

function todo(overrides: Partial<{ id: string; title: string; completed: boolean }> = {}) {
  return {
    id: `todo-${crypto.randomUUID()}`,
    title: 'Buy milk',
    completed: false,
    createdAt: new Date(),
    ...overrides,
  };
}

function formOf(element: HTMLElement): HTMLFormElement {
  const form = element.closest('form');
  if (form === null) {
    throw new Error('expected the element to sit inside a <form>');
  }
  return form;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoForm>', () => {
  it('AC-5.7: renders a text box labelled "New todo" and a button "Add"', () => {
    render(<TodoForm />);

    expect(screen.getByRole('textbox', { name: 'New todo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('AC-5.3: shows the title field error returned by the action', async () => {
    actions.createTodoAction.mockResolvedValue({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
  });

  it('AC-5.2: submits the typed title and clears the box on success', async () => {
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

  it('AC-10.5: shows 1 alert "Could not save, try again" in the form, keeps "Buy milk" in the box and "Add" enabled after a failed save, then shows 0 alerts and an empty box after the next save succeeds', async () => {
    actions.createTodoAction
      .mockResolvedValueOnce({ ok: false, fieldErrors: { form: ['Could not save, try again'] } })
      .mockResolvedValueOnce({ ok: true, data: todo({ title: 'Buy milk' }) });
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const button = screen.getByRole('button', { name: 'Add' });
    const form = formOf(textbox);

    await user.type(textbox, 'Buy milk');
    await user.click(button);

    const alerts = await within(form).findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Could not save, try again']);
    expect(textbox).toHaveValue('Buy milk');
    expect(button).toBeEnabled();

    await user.click(button);

    await waitFor(() => {
      expect(within(form).queryAllByRole('alert')).toHaveLength(0);
    });
    expect(textbox).toHaveValue('');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
  });

  it('AC-10.5: keeps the submitted title in the box after a failed save even when no change event wrote it', async () => {
    actions.createTodoAction.mockResolvedValue({ ok: false, fieldErrors: { form: ['Could not save, try again'] } });
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const form = formOf(textbox);
    if (!(textbox instanceof HTMLInputElement)) {
      throw new Error('expected the "New todo" text box to be an <input>');
    }
    textbox.value = 'Buy milk';

    await user.click(screen.getByRole('button', { name: 'Add' }));

    const alerts = await within(form).findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Could not save, try again']);
    expect(textbox).toHaveValue('Buy milk');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
    const formData = actions.createTodoAction.mock.calls[0]?.[1] as FormData;
    expect(formData.get('title')).toBe('Buy milk');
  });

  it('keeps text typed while the save is pending in the box after a failed save', async () => {
    let settle: (result: unknown) => void = () => undefined;
    actions.createTodoAction.mockReturnValueOnce(
      new Promise((resolve) => {
        settle = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const button = screen.getByRole('button', { name: 'Add' });
    const form = formOf(textbox);
    await user.type(textbox, 'Buy milk');
    await user.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    await user.type(textbox, ' now');
    settle({ ok: false, fieldErrors: { form: ['Could not save, try again'] } });

    const alerts = await within(form).findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Could not save, try again']);
    expect(textbox).toHaveValue('Buy milk now');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
  });
});
