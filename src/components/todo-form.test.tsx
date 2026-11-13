import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

interface KeyPress {
  readonly key: string;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly altKey?: boolean;
  readonly shiftKey?: boolean;
}

// §29: a native, cancelable keydown, so `key` reaches the handler as given (a legacy `Esc` stays `Esc`, which
// `user.keyboard` would not guarantee) and no character is inserted. Returns the event's `defaultPrevented`.
function pressKey(target: Element, press: KeyPress): boolean {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...press });

  fireEvent(target, event);

  return event.defaultPrevented;
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

// §29 Escape clears the new-todo title (B6.1).
describe('<TodoForm> Escape clears the title (§29)', () => {
  it('AC-29.1: Escape in the box holding Buy milk ("8 / 200") empties it, is prevented, reads exactly "0 / 200", calls createTodoAction 0 times and keeps the name "New todo"', async () => {
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const form = formOf(textbox);
    await user.type(textbox, 'Buy milk');
    expect(counterOf(form).textContent).toBe('8 / 200');

    const prevented = pressKey(textbox, { key: 'Escape' });

    expect(textbox).toHaveValue('');
    expect(prevented).toBe(true);
    expect(counterOf(form).textContent).toBe('0 / 200');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(0);
    expect(textbox).toHaveAccessibleName('New todo');
  });

  it.each<{ name: string; fill: (box: HTMLInputElement, user: ReturnType<typeof userEvent.setup>) => Promise<void> }>([
    { name: '(a) an empty box', fill: () => Promise.resolve() },
    {
      name: '(b) x ×201 set by a script with no input event',
      fill: (box) => {
        box.value = 'x'.repeat(201);
        return Promise.resolve();
      },
    },
    {
      name: '(c) "  hi  " typed',
      fill: async (box, user) => {
        await user.type(box, '  hi  ');
      },
    },
  ])(
    'AC-29.2: Escape in $name empties the box, is prevented, reads exactly "0 / 200" and calls createTodoAction 0 times',
    async ({ fill }) => {
      const user = userEvent.setup();
      render(<TodoForm />);
      const textbox = inputOf(screen.getByRole('textbox', { name: 'New todo' }));
      const form = formOf(textbox);
      await user.click(textbox);
      await fill(textbox, user);

      const prevented = pressKey(textbox, { key: 'Escape' });

      expect(textbox).toHaveValue('');
      expect(prevented).toBe(true);
      expect(counterOf(form).textContent).toBe('0 / 200');
      expect(actions.createTodoAction).toHaveBeenCalledTimes(0);
    },
  );

  it.each<{ name: string; press: KeyPress }>([
    { name: 'a', press: { key: 'a' } },
    { name: 'ArrowLeft', press: { key: 'ArrowLeft' } },
    { name: 'Esc', press: { key: 'Esc' } },
    { name: 'escape', press: { key: 'escape' } },
    { name: 'Ctrl+Escape', press: { key: 'Escape', ctrlKey: true } },
    { name: 'Meta+Escape', press: { key: 'Escape', metaKey: true } },
    { name: 'Alt+Escape', press: { key: 'Escape', altKey: true } },
    { name: 'Shift+Escape', press: { key: 'Escape', shiftKey: true } },
  ])(
    'AC-29.3: $name in the box is not prevented, keeps Buy milk and "8 / 200", and calls createTodoAction 0 times',
    async ({ press }) => {
      const user = userEvent.setup();
      render(<TodoForm />);
      const textbox = screen.getByRole('textbox', { name: 'New todo' });
      const form = formOf(textbox);
      await user.type(textbox, 'Buy milk');

      const prevented = pressKey(textbox, press);

      expect(prevented).toBe(false);
      expect(textbox).toHaveValue('Buy milk');
      expect(counterOf(form).textContent).toBe('8 / 200');
      expect(actions.createTodoAction).toHaveBeenCalledTimes(0);
    },
  );

  it('AC-29.3: Enter in the box calls createTodoAction exactly once with the form data title Buy milk', async () => {
    actions.createTodoAction.mockResolvedValue({ ok: true, data: todo({ title: 'Buy milk' }) });
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    await user.type(textbox, 'Buy milk');

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
    });
    const formData = actions.createTodoAction.mock.calls[0]?.[1] as FormData;
    expect(formData.get('title')).toBe('Buy milk');
  });

  it.each<{ name: string; target: () => Element }>([
    { name: 'document.body', target: () => document.body },
    { name: 'the button "Add"', target: () => screen.getByRole('button', { name: 'Add' }) },
    { name: 'the button "Other"', target: () => screen.getByRole('button', { name: 'Other' }) },
    { name: '"Search todos"', target: () => screen.getByRole('textbox', { name: 'Search todos' }) },
  ])(
    'AC-29.4: Escape on $name is not prevented, keeps Buy milk in "New todo" and "8 / 200", and calls createTodoAction 0 times',
    async ({ target }) => {
      const user = userEvent.setup();
      render(
        <>
          <TodoForm />
          <input type="text" aria-label="Search todos" />
          <button type="button">Other</button>
        </>,
      );
      const textbox = screen.getByRole('textbox', { name: 'New todo' });
      const form = formOf(textbox);
      await user.type(textbox, 'Buy milk');

      const prevented = pressKey(target(), { key: 'Escape' });

      expect(prevented).toBe(false);
      expect(textbox).toHaveValue('Buy milk');
      expect(counterOf(form).textContent).toBe('8 / 200');
      expect(actions.createTodoAction).toHaveBeenCalledTimes(0);
    },
  );

  it('AC-29.5: Escape while the save is pending is not prevented and keeps Buy milk, "8 / 200" and "Add" disabled; after the save succeeds the box is empty, the counter "0 / 200" and createTodoAction was called once', async () => {
    const saving = pendingSave();
    actions.createTodoAction.mockReturnValueOnce(saving.promise);
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

    const prevented = pressKey(textbox, { key: 'Escape' });

    expect(prevented).toBe(false);
    expect(textbox).toHaveValue('Buy milk');
    expect(counterOf(form).textContent).toBe('8 / 200');
    expect(button).toBeDisabled();

    saving.settle({ ok: true, data: todo({ title: 'Buy milk' }) });

    await waitFor(() => {
      expect(textbox).toHaveValue('');
    });
    await waitFor(() => {
      expect(counterOf(form).textContent).toBe('0 / 200');
    });
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
  });

  it('AC-29.6: after a failed save Escape empties the box, reads "0 / 200" and keeps exactly 1 alert "Could not save, try again"; Walk the dog then saves as the second call, leaving an empty box, "0 / 200" and 0 alerts', async () => {
    actions.createTodoAction
      .mockResolvedValueOnce(failedSave())
      .mockResolvedValueOnce({ ok: true, data: todo({ title: 'Walk the dog' }) });
    const user = userEvent.setup();
    render(<TodoForm />);
    const textbox = screen.getByRole('textbox', { name: 'New todo' });
    const button = screen.getByRole('button', { name: 'Add' });
    const form = formOf(textbox);
    await user.type(textbox, 'Buy milk');
    await user.click(button);
    await within(form).findAllByRole('alert');
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    pressKey(textbox, { key: 'Escape' });

    expect(textbox).toHaveValue('');
    expect(counterOf(form).textContent).toBe('0 / 200');
    expect(
      within(form)
        .getAllByRole('alert')
        .map((alert) => alert.textContent),
    ).toEqual(['Could not save, try again']);

    await user.type(textbox, 'Walk the dog');
    await user.click(button);

    await waitFor(() => {
      expect(within(form).queryAllByRole('alert')).toHaveLength(0);
    });
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
    const formData = actions.createTodoAction.mock.calls[1]?.[1] as FormData;
    expect(formData.get('title')).toBe('Walk the dog');
    expect(textbox).toHaveValue('');
    await waitFor(() => {
      expect(counterOf(form).textContent).toBe('0 / 200');
    });
  });
});
