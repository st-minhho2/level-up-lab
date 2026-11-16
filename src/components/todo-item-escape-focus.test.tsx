import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { TodoItem } from './todo-item';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);
// §19: TodoItem renders DeleteTodoButton, which imports this module; mocked at the boundary like '@/actions/todos'.
const deleteActions = vi.hoisted(() => ({
  deleteTodoAction: vi.fn(),
}));
vi.mock('@/actions/delete-todo', () => deleteActions);

interface OpenTodo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
}

type SaveResult =
  | { readonly ok: true; readonly data: OpenTodo }
  | { readonly ok: false; readonly fieldErrors: Readonly<Record<string, readonly string[]>> };

// A fresh object each call, so a re-render with it is "a new todo prop" (REQ-48.4).
function openTodo(title: string): OpenTodo {
  return { id: 'todo-9', title, completed: false, createdAt: new Date(2026, 0, 1) };
}

// §10: the one failure result a mutation can report besides its own field errors.
function saveFailed(): SaveResult {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

// A promise the test settles by hand, so the save or toggle stays in flight until then.
function deferred(): { readonly promise: Promise<SaveResult>; readonly resolve: (value: SaveResult) => void } {
  let resolve: (value: SaveResult) => void = () => undefined;
  const promise = new Promise<SaveResult>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

// The "Search todos" box is a plain element beside the row, so focus has somewhere else to go.
function withSearch(todo: OpenTodo): ReactNode {
  return (
    <>
      <input type="text" aria-label="Search todos" />
      <TodoItem todo={todo} />
    </>
  );
}

function titleField(): HTMLInputElement {
  const field = screen.getByRole('textbox', { name: 'Edit title' });
  if (!(field instanceof HTMLInputElement)) {
    throw new Error('the "Edit title" text box is not an <input>');
  }
  return field;
}

function editTitleButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Edit title' });
}

function searchBox(): HTMLElement {
  return screen.getByRole('textbox', { name: 'Search todos' });
}

// Counts the focus() calls whose receiver is `element`.
function focusCallsOn(spy: MockInstance, element: Element): number {
  return spy.mock.contexts.filter((receiver) => receiver === element).length;
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<TodoItem> Escape from the title editor focuses "Edit title" (§48)', () => {
  it('AC-48.1: 0 textbox roles; the button named "Edit title" is document.activeElement and not disabled; the row\'s label reads "Buy mik"; updateTodoTitleAction called 0 times', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Buy mik')} />);
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');

    await user.keyboard('{Escape}');

    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(document.activeElement).toBe(editTitleButton());
    expect(editTitleButton()).toBeEnabled();
    expect(screen.getByRole('listitem')).toHaveTextContent(/^Buy mik$/);
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(0);
  });

  it('AC-48.2: 0 alert roles in the row; 0 textbox roles; the button named "Edit title" is document.activeElement; updateTodoTitleAction called once (the rejected save), not again', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Buy mik')} />);
    const row = screen.getByRole('listitem');
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), '   ');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(within(row).getByRole('alert').textContent).toBe('Title is required'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');

    await user.keyboard('{Escape}');

    expect(within(row).queryAllByRole('alert')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(document.activeElement).toBe(editTitleButton());
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
  });

  it('AC-48.6: after clicking "Search todos" and a re-render with a new todo prop "Search todos" is document.activeElement; after "Edit title", Enter and an ok save document.activeElement is document.body, not the button; updateTodoTitleAction called once', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: true, data: openTodo('Buy mik') });
    const user = userEvent.setup();
    const { rerender } = render(withSearch(openTodo('Buy mik')));
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');
    await user.keyboard('{Escape}');
    // Precondition (AC-48.1): the Escape put focus on the button.
    expect(document.activeElement).toBe(editTitleButton());

    await user.click(searchBox());
    rerender(withSearch(openTodo('Buy mik')));

    expect(document.activeElement).toBe(searchBox());

    await user.click(editTitleButton());
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryAllByRole('textbox', { name: 'Edit title' })).toHaveLength(0));
    await waitFor(() => expect(editTitleButton()).toBeEnabled());

    expect(document.activeElement).toBe(document.body);
    expect(document.activeElement).not.toBe(editTitleButton());
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
  });

  it('AC-48.3: (a) with a save in flight the Escape keeps the field with "Buy milk" focused and 0 "Edit title" buttons; after the resolution 0 textbox roles, document.activeElement is document.body, updateTodoTitleAction called once', async () => {
    const save = deferred();
    actions.updateTodoTitleAction.mockReturnValue(save.promise);
    const user = userEvent.setup();
    const { rerender } = render(<TodoItem todo={openTodo('Buy mik')} />);
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');
    await user.keyboard('{Enter}');

    await user.keyboard('{Escape}');

    expect(titleField()).toHaveValue('Buy milk');
    expect(document.activeElement).toBe(titleField());
    expect(screen.queryAllByRole('button', { name: 'Edit title' })).toHaveLength(0);

    save.resolve({ ok: true, data: openTodo('Buy milk') });
    await waitFor(() => expect(screen.queryAllByRole('textbox')).toHaveLength(0));
    rerender(<TodoItem todo={openTodo('Buy milk')} />);

    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(document.activeElement).toBe(document.body);
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
  });

  it('AC-48.3: (b) with a toggle in flight the Escape keeps the field with "Buy milk" focused, before and after the resolution; toggleTodoAction called once', async () => {
    const toggle = deferred();
    actions.toggleTodoAction.mockReturnValue(toggle.promise);
    const user = userEvent.setup();
    render(<TodoItem todo={openTodo('Buy mik')} />);
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');
    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeDisabled());

    await user.click(titleField());
    await user.keyboard('{Escape}');

    expect(titleField()).toHaveValue('Buy milk');
    expect(document.activeElement).toBe(titleField());

    toggle.resolve({ ok: true, data: openTodo('Buy mik') });
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeEnabled());

    expect(titleField()).toHaveValue('Buy milk');
    expect(document.activeElement).toBe(titleField());
    expect(actions.toggleTodoAction).toHaveBeenCalledTimes(1);
  });

  it('AC-48.4: (a) a save resolved while the person types "milk" in "Search todos" leaves "Search todos" active with value "milk"; "Edit title" is in the document with 0 focus() calls', async () => {
    const save = deferred();
    actions.updateTodoTitleAction.mockReturnValue(save.promise);
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    const user = userEvent.setup();
    const { rerender } = render(withSearch(openTodo('Buy mik')));
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');

    await user.keyboard('{Enter}');
    await user.click(searchBox());
    await user.keyboard('milk');
    save.resolve({ ok: true, data: openTodo('Buy milk') });
    await waitFor(() => expect(screen.queryAllByRole('button', { name: 'Edit title' })).toHaveLength(1));
    rerender(withSearch(openTodo('Buy milk')));

    expect(document.activeElement).toBe(searchBox());
    expect(searchBox()).toHaveValue('milk');
    expect(editTitleButton()).toBeInTheDocument();
    expect(focusCallsOn(focusSpy, editTitleButton())).toBe(0);
  });

  it('AC-48.4: (b) a save by Enter with no move leaves document.activeElement at document.body after the resolution; "Edit title" has 0 focus() calls', async () => {
    const save = deferred();
    actions.updateTodoTitleAction.mockReturnValue(save.promise);
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    const user = userEvent.setup();
    const { rerender } = render(withSearch(openTodo('Buy mik')));
    await user.click(editTitleButton());
    await user.clear(titleField());
    await user.type(titleField(), 'Buy milk');

    await user.keyboard('{Enter}');
    save.resolve({ ok: true, data: openTodo('Buy milk') });
    await waitFor(() => expect(screen.queryAllByRole('button', { name: 'Edit title' })).toHaveLength(1));
    rerender(withSearch(openTodo('Buy milk')));

    expect(document.activeElement).toBe(document.body);
    expect(focusCallsOn(focusSpy, editTitleButton())).toBe(0);
  });

  it.each([
    {
      name: '(a) rejected',
      result: { ok: false, fieldErrors: { title: ['Title is required'] } } satisfies SaveResult,
      message: 'Title is required',
    },
    { name: '(b) saveFailed()', result: saveFailed(), message: 'Could not save, try again' },
  ])(
    'AC-48.5: $name, "Search todos" stays document.activeElement with value "x"; the field still holds "Buy milk"; exactly 1 alert with the action\'s message; 0 "Edit title" buttons',
    async ({ result, message }) => {
      const save = deferred();
      actions.updateTodoTitleAction.mockReturnValue(save.promise);
      const user = userEvent.setup();
      render(withSearch(openTodo('Buy mik')));
      const row = screen.getByRole('listitem');
      await user.click(editTitleButton());
      await user.clear(titleField());
      await user.type(titleField(), 'Buy milk');

      await user.keyboard('{Enter}');
      await user.click(searchBox());
      await user.keyboard('x');
      save.resolve(result);
      await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(1));

      expect(document.activeElement).toBe(searchBox());
      expect(searchBox()).toHaveValue('x');
      expect(titleField()).toHaveValue('Buy milk');
      expect(within(row).getByRole('alert').textContent).toBe(message);
      expect(screen.queryAllByRole('button', { name: 'Edit title' })).toHaveLength(0);
    },
  );
});
