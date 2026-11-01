import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { titleCounterText } from '@/lib/title-count';
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

function inputOf(element: HTMLElement): HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('expected the "New todo" text box to be an <input>');
  }
  return element;
}

// The §18 counter: the one element in the form whose whole text is `<used> / 200`.
const COUNTER_TEXT = /^\d+ \/ 200$/;

function counterOf(form: HTMLFormElement): HTMLElement {
  return within(form).getByText(COUNTER_TEXT);
}

function failedSave(): { ok: false; fieldErrors: { form: string[] } } {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

function pendingSave(): { promise: Promise<unknown>; settle: (result: unknown) => void } {
  let settle: (result: unknown) => void = () => undefined;
  const promise = new Promise<unknown>((resolve) => {
    settle = resolve;
  });
  return { promise, settle };
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

  it('AC-18.3: shows exactly 1 counter "0 / 200" (id new-todo-count, no alert, status or aria-live) as the box description, then "8 / 200" after typing Buy milk, "2 / 200" for "  hi  " and for a pasted 😀, keeps maxlength 200 and the name "New todo", and submits only title', async () => {
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const form = formOf(textbox);

    const rendered = within(form).getAllByText(COUNTER_TEXT);

    expect(rendered.map((element) => element.textContent)).toEqual(['0 / 200']);
    expect(rendered.map((element) => element.id)).toEqual(['new-todo-count']);
    expect(within(form).queryAllByRole('alert')).toHaveLength(0);
    expect(within(form).queryAllByRole('status')).toHaveLength(0);
    expect(form.querySelectorAll('[aria-live]')).toHaveLength(0);
    expect(textbox).toHaveAccessibleDescription('0 / 200');
    expect(textbox).toHaveAttribute('maxlength', '200');

    await user.type(textbox, 'Buy milk');

    expect(counterOf(form).textContent).toBe('8 / 200');
    expect(textbox).toHaveAccessibleDescription('8 / 200');
    expect(screen.getByRole('textbox', { name: 'New todo' })).toHaveAttribute('maxlength', '200');
    const formData = new FormData(form);
    expect([...formData.keys()]).toEqual(['title']);
    expect(formData.get('title')).toBe('Buy milk');

    await user.clear(textbox);
    await user.type(textbox, '  hi  ');

    expect(counterOf(form).textContent).toBe('2 / 200');
    expect(screen.getByRole('textbox', { name: 'New todo' })).toHaveAttribute('maxlength', '200');

    await user.clear(textbox);
    await user.click(textbox);
    await user.paste('\u{1F600}');

    expect(textbox).toHaveValue('\u{1F600}');
    expect(counterOf(form).textContent).toBe('2 / 200');
    expect(screen.getByRole('textbox', { name: 'New todo' })).toHaveAttribute('maxlength', '200');
  });

  it('AC-18.4: shows "0 / 200" with an empty box after a successful save, and after a title error the counter equals titleCounterText of the box value even when a script set 201 x with no input event', async () => {
    actions.createTodoAction
      .mockResolvedValueOnce({ ok: true, data: todo({ title: 'Buy milk' }) })
      .mockResolvedValueOnce({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    const first = render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const form = formOf(textbox);

    await user.type(textbox, 'Buy milk');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(textbox).toHaveValue('');
    });
    await waitFor(() => {
      expect(counterOf(form).textContent).toBe('0 / 200');
    });

    first.unmount();
    render(<TodoForm />);
    const box = inputOf(screen.getByRole('textbox', { name: 'New todo' }));
    const secondForm = formOf(box);
    box.value = 'x'.repeat(201);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    const alerts = await within(secondForm).findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Title is required']);
    await waitFor(() => {
      expect(counterOf(secondForm).textContent).toBe(titleCounterText(box.value));
    });
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
  });

  it('AC-18.5: after a failed save shows Buy milk, "8 / 200", 1 alert and the description "Could not save, try again 8 / 200"; a script-set Buy milk also reads "8 / 200"; the next successful save shows an empty box, "0 / 200" and 0 alerts', async () => {
    actions.createTodoAction
      .mockResolvedValueOnce(failedSave())
      .mockResolvedValueOnce({ ok: true, data: todo({ title: 'Buy milk' }) })
      .mockResolvedValueOnce(failedSave());
    const user = userEvent.setup();
    const first = render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const button = screen.getByRole('button', { name: 'Add' });
    const form = formOf(textbox);

    await user.type(textbox, 'Buy milk');
    await user.click(button);

    const alerts = await within(form).findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Could not save, try again']);
    expect(textbox).toHaveValue('Buy milk');
    await waitFor(() => {
      expect(counterOf(form).textContent).toBe('8 / 200');
    });
    expect(textbox).toHaveAccessibleDescription('Could not save, try again 8 / 200');

    await user.click(button);

    await waitFor(() => {
      expect(within(form).queryAllByRole('alert')).toHaveLength(0);
    });
    expect(textbox).toHaveValue('');
    await waitFor(() => {
      expect(counterOf(form).textContent).toBe('0 / 200');
    });

    first.unmount();
    render(<TodoForm />);
    const box = inputOf(screen.getByRole('textbox', { name: 'New todo' }));
    const secondForm = formOf(box);
    box.value = 'Buy milk';

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await within(secondForm).findAllByRole('alert');
    expect(box).toHaveValue('Buy milk');
    await waitFor(() => {
      expect(counterOf(secondForm).textContent).toBe('8 / 200');
    });
    expect(actions.createTodoAction).toHaveBeenCalledTimes(3);
  });

  it('AC-18.6: while a save is pending shows Buy milk now and "12 / 200", keeps both after the failure, and shows an empty box and "0 / 200" after a success', async () => {
    const failing = pendingSave();
    const succeeding = pendingSave();
    actions.createTodoAction.mockReturnValueOnce(failing.promise).mockReturnValueOnce(succeeding.promise);
    const user = userEvent.setup();
    const first = render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const button = screen.getByRole('button', { name: 'Add' });
    const form = formOf(textbox);
    await user.type(textbox, 'Buy milk');
    await user.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    await user.type(textbox, ' now');

    expect(textbox).toHaveValue('Buy milk now');
    expect(counterOf(form).textContent).toBe('12 / 200');

    failing.settle(failedSave());

    await within(form).findAllByRole('alert');
    expect(textbox).toHaveValue('Buy milk now');
    await waitFor(() => {
      expect(counterOf(form).textContent).toBe('12 / 200');
    });

    first.unmount();
    render(<TodoForm />);
    const box = screen.getByRole('textbox', { name: 'New todo' });
    const addButton = screen.getByRole('button', { name: 'Add' });
    const secondForm = formOf(box);
    await user.type(box, 'Buy milk');
    await user.click(addButton);
    await waitFor(() => {
      expect(addButton).toBeDisabled();
    });
    await user.type(box, ' now');
    expect(box).toHaveValue('Buy milk now');
    expect(counterOf(secondForm).textContent).toBe('12 / 200');

    succeeding.settle({ ok: true, data: todo({ title: 'Buy milk' }) });

    await waitFor(() => {
      expect(box).toHaveValue('');
    });
    await waitFor(() => {
      expect(counterOf(secondForm).textContent).toBe('0 / 200');
    });
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
  });
});
