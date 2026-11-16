import { act, render, screen, waitFor } from '@testing-library/react';
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

function addButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Add' });
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
});
