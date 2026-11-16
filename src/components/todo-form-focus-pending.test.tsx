import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoForm } from './todo-form';

const actions = vi.hoisted(() => ({ createTodoAction: vi.fn(), toggleTodoAction: vi.fn() }));
vi.mock('@/actions/todos', () => actions);

interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
}

interface SavedResult {
  readonly ok: true;
  readonly data: Todo;
}

interface Deferred {
  readonly promise: Promise<SavedResult>;
  readonly resolve: (value: SavedResult) => void;
}

function todo(title: string): Todo {
  return { id: `todo-${crypto.randomUUID()}`, title, completed: false, createdAt: new Date() };
}

function savedResult(title: string): SavedResult {
  return { ok: true, data: todo(title) };
}

// A save the test settles by hand, after it has moved focus (or not) while the action is pending.
function pendingSave(): Deferred {
  let resolve: (value: SavedResult) => void = () => undefined;
  const promise = new Promise<SavedResult>((settle) => {
    resolve = settle;
  });
  actions.createTodoAction.mockReturnValueOnce(promise);
  return { promise, resolve };
}

// The other controls are plain elements beside the form, so no other component is imported.
function Page(): ReactNode {
  return (
    <>
      <input type="text" aria-label="Search todos" />
      <input type="checkbox" aria-label="Buy milk" />
      <a href="#clear">Clear search</a>
      <label>
        Due date
        <input type="date" />
      </label>
      <TodoForm />
    </>
  );
}

function newTodoBox(): HTMLInputElement {
  const element = screen.getByRole('textbox', { name: 'New todo' });
  if (!(element instanceof HTMLInputElement)) {
    throw new Error('expected the "New todo" text box to be an <input>');
  }
  return element;
}

function searchBox(): HTMLElement {
  return screen.getByRole('textbox', { name: 'Search todos' });
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

// user-event tracks its own value; React's form.reset() bypasses the value setter, so clear the stale copy.
function clearStaleValue(): void {
  newTodoBox().value = '';
}

// "Add" is disabled while the action is pending.
async function pending(): Promise<void> {
  await waitFor(() => {
    expect(addButton()).toBeDisabled();
  });
}

// Blurs the active element while the save is pending, so document.activeElement is document.body. jsdom ignores
// blur() on a disabled control (the pending "Add" button), which a browser does unfocus, so the active element reads
// document.body until the caller restores the spy after the result settled; a focus() the result makes on the box
// is real and shows once the spy is restored.
function blurWhilePending(): { mockRestore: () => void } {
  act(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  return vi.spyOn(document, 'activeElement', 'get').mockReturnValue(document.body);
}

async function settle(save: Deferred, title: string): Promise<void> {
  await act(async () => {
    save.resolve(savedResult(title));
    await save.promise;
  });
  await waitFor(() => {
    expect(addButton()).toBeEnabled();
  });
  await waitFor(() => {
    expect(newTodoBox()).toHaveValue('');
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoForm> a focus move during a pending add is kept (§47)', () => {
  it('AC-47.1: "Search todos" is document.activeElement with value milk; the box value is "", its focus has 0 calls, the counter reads 0 / 200, the form holds 0 alerts and createTodoAction was called once with title Fresh', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const save = pendingSave();
    await user.type(newTodoBox(), 'Fresh');
    // Installed after the typing: user-event's own click on the box calls focus().
    const focus = vi.spyOn(newTodoBox(), 'focus');

    await user.click(addButton());
    await pending();
    await user.click(searchBox());
    await user.keyboard('milk');
    await settle(save, 'Fresh');

    const form = formOf(newTodoBox());
    expect(document.activeElement).toBe(searchBox());
    expect(searchBox()).toHaveValue('milk');
    expect(newTodoBox()).toHaveValue('');
    expect(focus).toHaveBeenCalledTimes(0);
    expect(within(form).getByText(/^\d+ \/ 200$/)).toHaveTextContent('0 / 200');
    expect(within(form).queryAllByRole('alert')).toHaveLength(0);
    expect(actions.createTodoAction).toHaveBeenCalledTimes(1);
    expect(submittedTitle(0)).toBe('Fresh');
  });

  it('AC-47.2: after each result the checkbox, the link and the date input in turn is document.activeElement, the box focus has 0 calls in total, its value is "" and createTodoAction was called 3 times', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const focus = vi.spyOn(newTodoBox(), 'focus');
    const controls = [
      screen.getByRole('checkbox', { name: 'Buy milk' }),
      screen.getByRole('link', { name: 'Clear search' }),
      screen.getByLabelText('Due date'),
    ];
    const activeAfter: (Element | null)[] = [];
    let resultCalls = 0;

    for (const control of controls) {
      clearStaleValue();
      const save = pendingSave();
      await user.type(newTodoBox(), 'Fresh');
      const before = focus.mock.calls.length;
      await user.click(addButton());
      await pending();
      act(() => {
        control.focus();
      });
      await settle(save, 'Fresh');
      activeAfter.push(document.activeElement);
      // The control's own focus() is on another element; only calls on the box after the click on "Add" count.
      resultCalls += focus.mock.calls.length - before;
    }

    expect(activeAfter).toEqual(controls);
    expect(resultCalls).toBe(0);
    expect(newTodoBox()).toHaveValue('');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(3);
  });

  it('AC-47.3: after each of the three results (Enter, a click on "Add", a blur to document.body) the box is document.activeElement with value "" and createTodoAction was called 3 times with titles One, Two and Three in that order', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const observed: { active: Element | null; value: string }[] = [];

    // (a) Enter in the box.
    const one = pendingSave();
    await user.type(newTodoBox(), 'One');
    await user.keyboard('{Enter}');
    await pending();
    await settle(one, 'One');
    observed.push({ active: document.activeElement, value: newTodoBox().value });

    // (b) a click on "Add".
    clearStaleValue();
    const two = pendingSave();
    await user.type(newTodoBox(), 'Two');
    await user.click(addButton());
    await pending();
    await settle(two, 'Two');
    observed.push({ active: document.activeElement, value: newTodoBox().value });

    // (c) a click on "Add", then the active element is blurred while pending, so focus is on document.body.
    clearStaleValue();
    const three = pendingSave();
    await user.type(newTodoBox(), 'Three');
    await user.click(addButton());
    await pending();
    const blurred = blurWhilePending();
    await settle(three, 'Three');
    blurred.mockRestore();
    observed.push({ active: document.activeElement, value: newTodoBox().value });

    expect(observed).toEqual([
      { active: newTodoBox(), value: '' },
      { active: newTodoBox(), value: '' },
      { active: newTodoBox(), value: '' },
    ]);
    expect(actions.createTodoAction).toHaveBeenCalledTimes(3);
    expect([submittedTitle(0), submittedTitle(1), submittedTitle(2)]).toEqual(['One', 'Two', 'Three']);
  });

  it('AC-47.4: after the first result "Search todos" is document.activeElement and the box focus has 0 calls; after the second result the box is document.activeElement with value "" and createTodoAction was called 2 times', async () => {
    const user = userEvent.setup();
    render(<Page />);

    const first = pendingSave();
    await user.type(newTodoBox(), 'Fresh');
    const focusFirst = vi.spyOn(newTodoBox(), 'focus');
    await user.click(addButton());
    await pending();
    await user.click(searchBox());
    await settle(first, 'Fresh');
    const activeAfterFirst = document.activeElement;
    const callsAfterFirst = focusFirst.mock.calls.length;
    focusFirst.mockRestore();

    clearStaleValue();
    const second = pendingSave();
    await user.click(newTodoBox());
    await user.keyboard('Again');
    await user.keyboard('{Enter}');
    await pending();
    await user.click(searchBox());
    await user.click(newTodoBox());
    await settle(second, 'Again');

    expect(activeAfterFirst).toBe(searchBox());
    expect(callsAfterFirst).toBe(0);
    expect(document.activeElement).toBe(newTodoBox());
    expect(newTodoBox()).toHaveValue('');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
  });
});
