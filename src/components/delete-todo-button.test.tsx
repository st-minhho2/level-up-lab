import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import { DeleteTodoButton } from './delete-todo-button';

const deleteActions = vi.hoisted(() => ({
  deleteTodoAction: vi.fn(),
}));
vi.mock('@/actions/delete-todo', () => deleteActions);

type DeleteResult = ActionResult<{ id: string }>;

function deleted(id: string): DeleteResult {
  return { ok: true, data: { id } };
}

// §10: the failure result the action reports when the delete fails.
function saveFailed(): DeleteResult {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

// §5: the failure result the action reports when the id names no todo.
function notFound(): DeleteResult {
  return { ok: false, fieldErrors: { id: ['Todo not found'] } };
}

// A promise the test settles by hand, so the button can be observed while the action is still pending.
function deferred(): { promise: Promise<DeleteResult>; resolve: (value: DeleteResult) => void } {
  let resolve: (value: DeleteResult) => void = () => undefined;
  const promise = new Promise<DeleteResult>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

// REQ-19.10: exactly one alert with exactly `text`, directly after the button inside the same parent.
async function expectOneAlertAfter(button: HTMLElement, text: string): Promise<void> {
  await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
  await waitFor(() => expect(screen.getByRole('alert').textContent).toBe(text));
  const alert = screen.getByRole('alert');
  expect(alert.parentElement).toBe(button.parentElement);
  expect(button.nextElementSibling).toBe(alert);
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<DeleteTodoButton> (§19)', () => {
  it('AC-19.5: (a) renders exactly 1 enabled button named "Delete todo", calls window.confirm once and the action once with exactly ("todo-9") and opens no other dialog, is disabled while it is pending and enabled again once it resolves', async () => {
    const action = deferred();
    deleteActions.deleteTodoAction.mockReturnValue(action.promise);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Delete todo' })).toHaveLength(1);
    const button = screen.getByRole('button', { name: 'Delete todo' });
    expect(button).toBeEnabled();

    await user.click(button);

    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(1);
    expect(deleteActions.deleteTodoAction.mock.calls[0]).toEqual(['todo-9']);
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(deleted('todo-9'));
    await waitFor(() => expect(button).toBeEnabled());
    // Asserted after the action settles, so a failure here leaves no transition pending for the next test.
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('AC-19.6: shows exactly one alert "Could not save, try again", then exactly one alert "Todo not found", each directly after the enabled button, and 0 alerts after the next success', async () => {
    deleteActions.deleteTodoAction
      .mockResolvedValueOnce(saveFailed())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(deleted('todo-9'));
    // §35: every click is confirmed, so each one reaches the action.
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    const button = screen.getByRole('button', { name: 'Delete todo' });

    await user.click(button);

    await expectOneAlertAfter(button, 'Could not save, try again');
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    await expectOneAlertAfter(button, 'Todo not found');
    await waitFor(() => expect(button).toBeEnabled());

    // REQ-19.11: the next successful attempt on the same button removes the message.
    await user.click(button);

    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(3);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0));
  });
});

// §35: the exact message of the confirmation, copied from REQ-35.1.
const CONFIRM_MESSAGE = 'Delete this todo? This cannot be undone.';

describe('<DeleteTodoButton> asks for confirmation first (§35)', () => {
  it('AC-35.1: asks window.confirm once with "Delete this todo? This cannot be undone." before calling deleteTodoAction once with ("todo-9")', async () => {
    deleteActions.deleteTodoAction.mockResolvedValue(deleted('todo-9'));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);

    await user.click(screen.getByRole('button', { name: 'Delete todo' }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0]).toEqual([CONFIRM_MESSAGE]);
    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(1);
    expect(deleteActions.deleteTodoAction.mock.calls[0]).toEqual(['todo-9']);
    const confirmOrder = confirm.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY;
    const actionOrder = deleteActions.deleteTodoAction.mock.invocationCallOrder[0] ?? Number.NEGATIVE_INFINITY;
    expect(confirmOrder).toBeLessThan(actionOrder);
  });

  it('AC-35.2: (a) a cancel calls window.confirm once, the action 0 times, leaves the button enabled and 0 alerts; (b) a cancel after a failed attempt calls the action still once and keeps the same single alert "Could not save, try again" with the button enabled', async () => {
    deleteActions.deleteTodoAction.mockResolvedValue(saveFailed());
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    const first = render(<DeleteTodoButton todoId="todo-9" />);
    const cancelled = screen.getByRole('button', { name: 'Delete todo' });

    await user.click(cancelled);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(0);
    expect(cancelled).toBeEnabled();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);

    // (b) a fresh render: the first click is confirmed and fails, the second is cancelled.
    first.unmount();
    confirm.mockReset();
    confirm.mockReturnValueOnce(true).mockReturnValueOnce(false);
    render(<DeleteTodoButton todoId="todo-9" />);
    const button = screen.getByRole('button', { name: 'Delete todo' });

    await user.click(button);

    await expectOneAlertAfter(button, 'Could not save, try again');
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    expect(confirm).toHaveBeenCalledTimes(2);
    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(1);
    await expectOneAlertAfter(button, 'Could not save, try again');
    expect(button).toBeEnabled();
  });
});
