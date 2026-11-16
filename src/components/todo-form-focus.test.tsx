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

function formFailure(): { ok: false; fieldErrors: { form: string[] } } {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

function titleFailure(): { ok: false; fieldErrors: { title: string[] } } {
  return { ok: false, fieldErrors: { title: ['Title is required'] } };
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

  it('AC-44.2: document.activeElement is document.body after the render and still after typing Buy with no click, the box value is "" and createTodoAction was called 0 times', async () => {
    const user = userEvent.setup();
    render(<TodoForm />);

    const afterRender = document.activeElement;
    await user.keyboard('Buy');

    expect(afterRender).toBe(document.body);
    expect(document.activeElement).toBe(document.body);
    expect(newTodoBox()).toHaveValue('');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(0);
  });

  it('AC-44.3: after (a) a form failure and (b) a title error the box focus has 0 calls, the box is not document.activeElement, exactly 1 alert shows the action message and in (a) the box keeps Buy milk', async () => {
    const user = userEvent.setup();

    // (a) a `form` failure after typing Buy milk. The spy is installed after the typing, because user-event's own
    // click on the box calls focus(); every call it counts comes from the submit and its result.
    actions.createTodoAction.mockResolvedValueOnce(formFailure());
    const first = render(<TodoForm />);
    await user.type(newTodoBox(), 'Buy milk');
    const focusA = vi.spyOn(newTodoBox(), 'focus');
    await user.click(addButton());
    const alertA = await screen.findByRole('alert');
    await settled();

    expect(focusA).toHaveBeenCalledTimes(0);
    expect(document.activeElement).not.toBe(newTodoBox());
    expect(within(formOf(newTodoBox())).getAllByRole('alert')).toHaveLength(1);
    expect(alertA).toHaveTextContent('Could not save, try again');
    expect(newTodoBox()).toHaveValue('Buy milk');

    first.unmount();

    // (b) a `title` error after a click on "Add" with the box empty.
    actions.createTodoAction.mockResolvedValueOnce(titleFailure());
    render(<TodoForm />);
    const focusB = vi.spyOn(newTodoBox(), 'focus');
    await user.click(addButton());
    const alertB = await screen.findByRole('alert');
    await settled();

    expect(focusB).toHaveBeenCalledTimes(0);
    expect(document.activeElement).not.toBe(newTodoBox());
    expect(within(formOf(newTodoBox())).getAllByRole('alert')).toHaveLength(1);
    expect(alertB).toHaveTextContent('Title is required');
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
    // user-event tracks its own value; React's form.reset() bypasses the value setter, so clear the stale copy.
    newTodoBox().value = '';

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
    // user-event tracks its own value; React's form.reset() bypasses the value setter, so clear the stale copy.
    newTodoBox().value = '';

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
