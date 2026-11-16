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

function savedResult(title: string): { ok: true; data: ReturnType<typeof todo> } {
  return { ok: true, data: todo({ title }) };
}

function newTodoBox(): HTMLInputElement {
  const element = screen.getByRole('textbox', { name: 'New todo' });
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('expected the "New todo" text box to be an <input>');
  }
  return element;
}

function addButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Add' });
}

function formOf(element: HTMLElement): HTMLFormElement {
  const form = element.closest('form');
  if (form === null) {
    throw new Error('expected the element to sit inside a <form>');
  }
  return form;
}

function submittedTitle(call: number): FormDataEntryValue | null {
  const formData = actions.createTodoAction.mock.calls[call]?.[1] as FormData;
  return formData.get('title');
}

// A settled save: "Add" is enabled again (it is disabled while the action is pending).
async function settled(): Promise<void> {
  await waitFor(() => {
    expect(addButton()).toBeEnabled();
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoForm> focus after a successful add (§44)', () => {
  it('AC-44.1: the "New todo" box is document.activeElement with value "" and createTodoAction was called once with title Buy milk', async () => {
    actions.createTodoAction.mockResolvedValue(savedResult('Buy milk'));
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.type(newTodoBox(), 'Buy milk');
    await user.click(addButton());
    await waitFor(() => {
      expect(newTodoBox()).toHaveValue('');
    });
    await settled();

    expect(document.activeElement).toBe(newTodoBox());
    expect(newTodoBox()).toHaveValue('');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
    expect(submittedTitle(0)).toBe('Buy milk');
  });

  it('AC-44.4: the box is focused after the first result, "Add" is focused after Tab with 1 call, and the box is focused again with value "" after the second result with 2 calls', async () => {
    actions.createTodoAction.mockResolvedValue(savedResult('Buy milk'));
    const user = userEvent.setup();
    render(<TodoForm />);

    await user.type(newTodoBox(), 'Buy milk');
    await user.click(addButton());
    await waitFor(() => {
      expect(newTodoBox()).toHaveValue('');
    });
    await settled();

    expect(document.activeElement).toBe(newTodoBox());

    await user.tab();

    expect(document.activeElement).toBe(addButton());
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);

    await user.click(newTodoBox());
    await user.keyboard('Walk the dog');
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(newTodoBox()).toHaveValue('');
    });
    await settled();

    expect(document.activeElement).toBe(newTodoBox());
    expect(newTodoBox()).toHaveValue('');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
    expect(submittedTitle(1)).toBe('Walk the dog');
  });

  it('AC-44.5: typing Walk with no click after the save gives the value Walk, the counter 4 / 200, maxlength 200, the name "New todo", aria-describedby new-todo-count and 0 alerts', async () => {
    actions.createTodoAction.mockResolvedValue(savedResult('Buy milk'));
    const user = userEvent.setup();
    render(<TodoForm />);
    await user.type(newTodoBox(), 'Buy milk');
    await user.click(addButton());
    await waitFor(() => {
      expect(newTodoBox()).toHaveValue('');
    });
    await settled();

    await user.keyboard('Walk');

    const box = newTodoBox();
    const form = formOf(box);
    expect(box).toHaveValue('Walk');
    expect(within(form).getByText(/^\d+ \/ 200$/)).toHaveTextContent('4 / 200');
    expect(box).toHaveAttribute('maxlength', '200');
    expect(box).toHaveAccessibleName('New todo');
    expect(box).toHaveAttribute('aria-describedby', 'new-todo-count');
    expect(within(form).queryAllByRole('alert')).toHaveLength(0);
  });
});
