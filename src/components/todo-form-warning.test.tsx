// §39 the new-todo counter warns near the limit (B7.5).
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoForm } from './todo-form';

const actions = vi.hoisted(() => ({ createTodoAction: vi.fn(), toggleTodoAction: vi.fn() }));
vi.mock('@/actions/todos', () => actions);

const WARNING_TEXT = 'Almost at the character limit';
const WARNING_CLASS = 'text-sm text-amber-700 dark:text-amber-400';

// The §18 counter: the one element in the form whose whole text is `<used> / 200`.
const COUNTER_TEXT = /^\d+ \/ 200$/;

function todo(overrides: Partial<{ title: string }> = {}) {
  return {
    id: `todo-${crypto.randomUUID()}`,
    title: 'x'.repeat(180),
    completed: false,
    createdAt: new Date(),
    ...overrides,
  };
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

function newTodoBox(): HTMLInputElement {
  return inputOf(screen.getByRole('textbox', { name: 'New todo' }));
}

function warningsIn(root: ParentNode): Element[] {
  return [...root.querySelectorAll('#new-todo-warning')];
}

function countersIn(form: HTMLFormElement): HTMLElement[] {
  return within(form).queryAllByText(COUNTER_TEXT);
}

// Sets the box as a change event would (§18 REQ-18.4), without typing each character.
function setBox(box: HTMLInputElement, value: string): void {
  fireEvent.change(box, { target: { value } });
}

// §29: a native, cancelable keydown, so `key` reaches the handler as given and no character is inserted.
function pressEscape(target: Element): void {
  fireEvent(target, new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }));
}

function follows(earlier: Node, later: Node): boolean {
  return (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<TodoForm> near-limit warning (§39)', () => {
  it('AC-39.2: shows 0 warnings on render, at 179 and after deleting one of 180; at 180 exactly 1 <p> "Almost at the character limit" with the amber class, no hidden attribute, after new-todo-count and before any alert', async () => {
    const user = userEvent.setup();
    render(<TodoForm />);
    const box = newTodoBox();
    const form = formOf(box);

    expect(warningsIn(document)).toHaveLength(0);
    expect(warningsIn(form)).toHaveLength(0);

    setBox(box, 'x'.repeat(179));

    expect(warningsIn(document)).toHaveLength(0);
    expect(warningsIn(form)).toHaveLength(0);

    setBox(box, 'x'.repeat(180));

    expect(warningsIn(document)).toHaveLength(1);
    const found = warningsIn(form);
    expect(found).toHaveLength(1);
    const warning = found[0];
    if (warning === undefined) {
      throw new Error('expected one #new-todo-warning in the form');
    }
    expect(warning.tagName).toBe('P');
    expect(warning.textContent).toBe(WARNING_TEXT);
    expect(warning.getAttribute('class')).toBe(WARNING_CLASS);
    expect(warning.hasAttribute('hidden')).toBe(false);
    const counter = document.getElementById('new-todo-count');
    if (counter === null) {
      throw new Error('expected the #new-todo-count counter');
    }
    expect(follows(counter, warning)).toBe(true);
    const alerts = within(form).queryAllByRole('alert');
    expect(alerts.filter((alert) => !follows(warning, alert))).toHaveLength(0);

    await user.type(box, '{Backspace}');

    expect(box).toHaveValue('x'.repeat(179));
    expect(warningsIn(document)).toHaveLength(0);
    expect(warningsIn(form)).toHaveLength(0);
  });

  it('AC-39.3: the warning is absent, present, present, present for 5 spaces + 175 x, 1 space + 180 x + 1 space, 200 x and a script-set 201 x, with the counter reading 175, 180, 200, 201 / 200 as the only counter and the whole description, and aria-describedby new-todo-count', () => {
    const view = render(<TodoForm />);
    const box = newTodoBox();
    const form = formOf(box);
    const steps: readonly { value: string; warnings: number; counter: string; byScript: boolean }[] = [
      { value: ' '.repeat(5) + 'x'.repeat(175), warnings: 0, counter: '175 / 200', byScript: false },
      { value: ' ' + 'x'.repeat(180) + ' ', warnings: 1, counter: '180 / 200', byScript: false },
      { value: 'x'.repeat(200), warnings: 1, counter: '200 / 200', byScript: false },
      { value: 'x'.repeat(201), warnings: 1, counter: '201 / 200', byScript: true },
    ];
    const observed: { warnings: number; counters: (string | null)[]; description: string | null }[] = [];

    for (const step of steps) {
      if (step.byScript) {
        // No input event: the value reaches the form on its next commit (§18 REQ-18.4's layout effect re-reads the box).
        box.value = step.value;
        view.rerender(<TodoForm />);
      } else {
        setBox(box, step.value);
      }
      observed.push({
        warnings: warningsIn(form).length,
        counters: countersIn(form).map((element) => element.textContent),
        description: box.getAttribute('aria-describedby'),
      });
      expect(box).toHaveAccessibleDescription(step.counter);
    }

    expect(observed).toEqual(
      steps.map((step) => ({ warnings: step.warnings, counters: [step.counter], description: 'new-todo-count' })),
    );
  });

  it("AC-39.4: (a) after typing 180 x and a successful save the box is '', the counter 0 / 200 and the warning absent; (b) while pending with ' y' typed the box holds 182 characters and the warning shows, and after the failure the box keeps 180 x + ' y', the warning, 1 alert \"Could not save, try again\" and aria-describedby \"new-todo-error new-todo-count\"", async () => {
    const failing = pendingSave();
    actions.createTodoAction.mockResolvedValueOnce({ ok: true, data: todo() }).mockReturnValueOnce(failing.promise);
    const user = userEvent.setup();
    const first = render(<TodoForm />);
    const box = newTodoBox();
    const form = formOf(box);
    await user.type(box, 'x'.repeat(180));
    expect(warningsIn(form)).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => {
      expect(box).toHaveValue('');
    });
    await waitFor(() => {
      expect(countersIn(form).map((element) => element.textContent)).toEqual(['0 / 200']);
    });
    expect(warningsIn(form)).toHaveLength(0);

    first.unmount();
    render(<TodoForm />);
    const secondBox = newTodoBox();
    const secondForm = formOf(secondBox);
    const button = screen.getByRole('button', { name: 'Add' });
    await user.type(secondBox, 'x'.repeat(180));
    await user.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    await user.type(secondBox, ' y');

    expect(secondBox.value).toHaveLength(182);
    expect(warningsIn(secondForm)).toHaveLength(1);

    failing.settle(failedSave());

    const alerts = await within(secondForm).findAllByRole('alert');
    expect(alerts.map((alert) => alert.textContent)).toEqual(['Could not save, try again']);
    expect(secondBox).toHaveValue('x'.repeat(180) + ' y');
    await waitFor(() => {
      expect(warningsIn(secondForm)).toHaveLength(1);
    });
    expect(secondBox).toHaveAttribute('aria-describedby', 'new-todo-error new-todo-count');
    expect(actions.createTodoAction).toHaveBeenCalledTimes(2);
  });

  it('AC-39.5: Escape in the box holding 190 x empties it, reads 0 / 200, removes the warning and calls createTodoAction 0 times; after typing Walk the dog 0 warnings, the form data is exactly title = Walk the dog, maxlength 200 and the name "New todo" stay', async () => {
    const user = userEvent.setup();
    render(<TodoForm />);
    const box = newTodoBox();
    const form = formOf(box);
    setBox(box, 'x'.repeat(190));
    box.focus();
    expect(warningsIn(form)).toHaveLength(1);

    pressEscape(box);

    expect(box).toHaveValue('');
    expect(countersIn(form).map((element) => element.textContent)).toEqual(['0 / 200']);
    expect(warningsIn(form)).toHaveLength(0);
    expect(actions.createTodoAction).toHaveBeenCalledTimes(0);

    await user.type(box, 'Walk the dog');

    expect(warningsIn(form)).toHaveLength(0);
    const formData = new FormData(form);
    expect([...formData.keys()]).toEqual(['title']);
    expect(formData.get('title')).toBe('Walk the dog');
    expect(box).toHaveAttribute('maxlength', '200');
    expect(box).toHaveAccessibleName('New todo');
  });

  it('AC-39.6: at 200 x the 1 warning has no role, aria-live, aria-atomic or aria-hidden; the form has 0 alert, status or aria-live elements; aria-describedby is exactly new-todo-count and the description exactly 200 / 200', () => {
    render(<TodoForm />);
    const box = newTodoBox();
    const form = formOf(box);

    setBox(box, 'x'.repeat(200));

    const found = warningsIn(form);
    expect(found).toHaveLength(1);
    const attributes = ['role', 'aria-live', 'aria-atomic', 'aria-hidden'];
    expect(found.flatMap((warning) => attributes.filter((name) => warning.hasAttribute(name)))).toEqual([]);
    expect(within(form).queryAllByRole('alert')).toHaveLength(0);
    expect(within(form).queryAllByRole('status')).toHaveLength(0);
    expect(form.querySelectorAll('[aria-live]')).toHaveLength(0);
    expect(box).toHaveAttribute('aria-describedby', 'new-todo-count');
    expect(box).toHaveAccessibleDescription('200 / 200');
  });
});
