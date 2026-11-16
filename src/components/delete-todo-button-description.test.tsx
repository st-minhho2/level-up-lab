import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import { DeleteTodoButton } from './delete-todo-button';
import { TodoItem } from './todo-item';

// §5, §6, §15: TodoItem (AC-53.6) imports these; mocked at the boundary as in todo-item.test.tsx.
const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);
// §19: the delete action, mocked at the boundary as in delete-todo-button.test.tsx.
const deleteActions = vi.hoisted(() => ({
  deleteTodoAction: vi.fn(),
}));
vi.mock('@/actions/delete-todo', () => deleteActions);

type DeleteResult = ActionResult<{ id: string }>;

const SAVE_FAILED = 'Could not save, try again';
const NOT_FOUND = 'Todo not found';

function deleted(id: string): DeleteResult {
  return { ok: true, data: { id } };
}

// §10: the failure result the action reports when the delete fails.
function saveFailed(): DeleteResult {
  return { ok: false, fieldErrors: { form: [SAVE_FAILED] } };
}

// §5: the failure result the action reports when the id names no todo.
function notFound(): DeleteResult {
  return { ok: false, fieldErrors: { id: [NOT_FOUND] } };
}

// A promise the test settles by hand, so the button can be observed while the action is still pending.
function deferred(): { promise: Promise<DeleteResult>; resolve: (value: DeleteResult) => void } {
  let resolve: (value: DeleteResult) => void = () => undefined;
  const promise = new Promise<DeleteResult>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

// §19 AC-19.5 (b): the open todo "Walk the dog" with id todo-1.
function walkTheDog(): { id: string; title: string; completed: boolean; createdAt: Date } {
  return { id: 'todo-1', title: 'Walk the dog', completed: false, createdAt: new Date(2026, 0, 1) };
}

function deleteButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Delete todo' });
}

// Exactly one alert with exactly `text`; returns it.
async function oneAlert(text: string): Promise<HTMLElement> {
  await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe(text));
  return screen.getByRole('alert');
}

function ariaAttributeNames(element: HTMLElement): string[] {
  return element
    .getAttributeNames()
    .filter((name) => name.startsWith('aria-'))
    .sort();
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<DeleteTodoButton> describes the button with its failure message (§53)', () => {
  it('AC-53.1: before the click the button has no aria-describedby; after a failed delete exactly 1 alert "Could not save, try again" with a non-empty id, the button aria-describedby equals that id, its description is exactly the message and its name exactly "Delete todo"', async () => {
    deleteActions.deleteTodoAction.mockResolvedValue(saveFailed());
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    const button = deleteButton();
    expect(button).not.toHaveAttribute('aria-describedby');

    await user.click(button);

    const alert = await oneAlert(SAVE_FAILED);
    await waitFor(() => expect(button).toBeEnabled());
    expect(alert.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(alert.id);
    expect(button).toHaveAccessibleDescription(SAVE_FAILED);
    expect(button).toHaveAccessibleName('Delete todo');
  });

  it('AC-53.2: after (a) and (b) exactly 1 alert described by the button with "Could not save, try again" then "Todo not found"; after (c) 0 alerts, no aria-describedby and the name "Delete todo"; after (a) the aria-* names are exactly aria-describedby and aria-label and the title is "Delete todo"', async () => {
    deleteActions.deleteTodoAction
      .mockResolvedValueOnce(saveFailed())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(deleted('todo-9'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    const button = deleteButton();

    await user.click(button);

    const first = await oneAlert(SAVE_FAILED);
    await waitFor(() => expect(button).toBeEnabled());
    expect(first.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(first.id);
    expect(button).toHaveAccessibleDescription(SAVE_FAILED);
    expect(ariaAttributeNames(button)).toEqual(['aria-describedby', 'aria-label']);
    expect(button.getAttribute('title')).toBe('Delete todo');

    await user.click(button);

    const second = await oneAlert(NOT_FOUND);
    await waitFor(() => expect(button).toBeEnabled());
    expect(second.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(second.id);
    expect(button).toHaveAccessibleDescription(NOT_FOUND);

    await user.click(button);

    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0));
    await waitFor(() => expect(button).toBeEnabled());
    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(3);
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).toHaveAccessibleName('Delete todo');
  });

  it('AC-53.3: while the retry is pending the disabled button keeps 1 alert "Could not save, try again" as its aria-describedby and description; after the resolve the enabled button is described by the 1 alert "Todo not found"', async () => {
    const retry = deferred();
    deleteActions.deleteTodoAction.mockResolvedValueOnce(saveFailed()).mockReturnValueOnce(retry.promise);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    const button = deleteButton();
    await user.click(button);
    await oneAlert(SAVE_FAILED);
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    // Soft while pending, so a failure still settles the action and leaves no transition pending for the next test.
    await waitFor(() => expect(button).toBeDisabled());
    const pendingAlerts = screen.queryAllByRole('alert');
    expect.soft(pendingAlerts).toHaveLength(1);
    expect.soft(pendingAlerts[0]?.textContent).toBe(SAVE_FAILED);
    expect.soft(pendingAlerts[0]?.id).not.toBe('');
    expect.soft(button.getAttribute('aria-describedby')).toBe(pendingAlerts[0]?.id);
    expect.soft(button).toHaveAccessibleDescription(SAVE_FAILED);

    retry.resolve(notFound());

    await waitFor(() => expect(button).toBeEnabled());
    const settled = await oneAlert(NOT_FOUND);
    expect(settled.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(settled.id);
    expect(button).toHaveAccessibleDescription(NOT_FOUND);
  });

  it('AC-53.4: a cancel after a failed delete calls window.confirm twice and the action once, keeps the same alert node with the same id and text "Could not save, try again", the same aria-describedby and description, and the button enabled', async () => {
    deleteActions.deleteTodoAction.mockResolvedValue(saveFailed());
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(true).mockReturnValueOnce(false);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    const button = deleteButton();
    await user.click(button);
    const before = await oneAlert(SAVE_FAILED);
    await waitFor(() => expect(button).toBeEnabled());
    const idBefore = before.id;
    const describedByBefore = button.getAttribute('aria-describedby');

    await user.click(button);

    expect(confirm).toHaveBeenCalledTimes(2);
    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(1);
    const after = await oneAlert(SAVE_FAILED);
    expect(after).toBe(before);
    expect(idBefore).not.toBe('');
    expect(after.id).toBe(idBefore);
    expect(describedByBefore).toBe(idBefore);
    expect(button.getAttribute('aria-describedby')).toBe(describedByBefore);
    expect(button).toHaveAccessibleDescription(SAVE_FAILED);
    expect(button).toBeEnabled();
  });

  it('AC-53.5: two buttons get 2 different non-empty alert ids, none equal to a §10 or §15 row id, each button described by the alert that follows it with "Could not save, try again" and "Todo not found", and every id once in the document', async () => {
    deleteActions.deleteTodoAction.mockImplementation((id: string) =>
      Promise.resolve(id === 'todo-1' ? saveFailed() : notFound()),
    );
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(
      <>
        <DeleteTodoButton todoId="todo-1" />
        <DeleteTodoButton todoId="todo-2" />
      </>,
    );
    const [firstButton, secondButton] = screen.getAllByRole('button', { name: 'Delete todo' });
    if (firstButton === undefined || secondButton === undefined) throw new Error('expected 2 "Delete todo" buttons');

    await user.click(firstButton);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    await waitFor(() => expect(firstButton).toBeEnabled());
    await user.click(secondButton);

    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(2));
    await waitFor(() => expect(secondButton).toBeEnabled());
    const firstAlert = firstButton.nextElementSibling;
    const secondAlert = secondButton.nextElementSibling;
    if (!(firstAlert instanceof HTMLElement) || !(secondAlert instanceof HTMLElement)) {
      throw new Error('expected an alert right after each button');
    }
    expect(firstAlert.getAttribute('role')).toBe('alert');
    expect(secondAlert.getAttribute('role')).toBe('alert');
    expect(firstAlert.textContent).toBe(SAVE_FAILED);
    expect(secondAlert.textContent).toBe(NOT_FOUND);
    expect(firstAlert.id).not.toBe('');
    expect(secondAlert.id).not.toBe('');
    expect(firstAlert.id).not.toBe(secondAlert.id);
    const rowIds = [
      'todo-todo-1-error',
      'todo-todo-2-error',
      'todo-todo-1-due-date-error',
      'todo-todo-2-due-date-error',
    ];
    expect(rowIds).not.toContain(firstAlert.id);
    expect(rowIds).not.toContain(secondAlert.id);
    expect(firstButton.getAttribute('aria-describedby')).toBe(firstAlert.id);
    expect(secondButton.getAttribute('aria-describedby')).toBe(secondAlert.id);
    expect(firstButton).toHaveAccessibleDescription(SAVE_FAILED);
    expect(secondButton).toHaveAccessibleDescription(NOT_FOUND);
    const allIds = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
    expect(allIds.filter((id) => id === firstAlert.id)).toHaveLength(1);
    expect(allIds.filter((id) => id === secondAlert.id)).toHaveLength(1);
  });

  it('AC-53.6: the row holds exactly 2 alerts, the toggle one with id "todo-todo-1-error" and "Could not save, try again" and the delete one with a different id and "Todo not found"; "Delete todo" is described by the delete alert with "Todo not found", the checkbox is still named "Walk the dog" and the idle row text is "Walk the dog"', async () => {
    actions.toggleTodoAction.mockResolvedValue({ ok: false, fieldErrors: { form: [SAVE_FAILED] } });
    deleteActions.deleteTodoAction.mockResolvedValue(notFound());
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<TodoItem todo={walkTheDog()} />);
    const row = screen.getByRole('listitem');
    expect(row).toHaveTextContent(/^Walk the dog$/);

    await user.click(screen.getByRole('checkbox', { name: 'Walk the dog' }));
    await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(1));
    await user.click(within(row).getByRole('button', { name: 'Delete todo' }));

    await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(2));
    const button = within(row).getByRole('button', { name: 'Delete todo' });
    await waitFor(() => expect(button).toBeEnabled());
    const alerts = within(row).getAllByRole('alert');
    const toggleAlert = alerts.find((alert) => alert.id === 'todo-todo-1-error');
    const deleteAlert = alerts.find((alert) => alert.id !== 'todo-todo-1-error');
    if (toggleAlert === undefined || deleteAlert === undefined)
      throw new Error('expected the toggle and delete alerts');
    expect(toggleAlert.textContent).toBe(SAVE_FAILED);
    expect(deleteAlert.textContent).toBe(NOT_FOUND);
    expect(deleteAlert.id).not.toBe('');
    expect(deleteAlert.id).not.toBe('todo-todo-1-error');
    expect(button.getAttribute('aria-describedby')).toBe(deleteAlert.id);
    expect(button).toHaveAccessibleDescription(NOT_FOUND);
    expect(within(row).getByRole('checkbox', { name: 'Walk the dog' })).toBeInTheDocument();
  });
});
