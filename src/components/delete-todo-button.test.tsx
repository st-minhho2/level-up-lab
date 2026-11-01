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
  it('AC-19.5: (a) renders exactly 1 enabled button named "Delete todo", calls the action once with exactly ("todo-9") without a confirmation, is disabled while it is pending and enabled again once it resolves', async () => {
    const action = deferred();
    deleteActions.deleteTodoAction.mockReturnValue(action.promise);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<DeleteTodoButton todoId="todo-9" />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Delete todo' })).toHaveLength(1);
    const button = screen.getByRole('button', { name: 'Delete todo' });
    expect(button).toBeEnabled();

    await user.click(button);

    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(1);
    expect(deleteActions.deleteTodoAction.mock.calls[0]).toEqual(['todo-9']);
    expect(confirm).toHaveBeenCalledTimes(0);
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(deleted('todo-9'));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('AC-19.6: shows exactly one alert "Could not save, try again", then exactly one alert "Todo not found", each directly after the enabled button, and 0 alerts after the next success', async () => {
    deleteActions.deleteTodoAction
      .mockResolvedValueOnce(saveFailed())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(deleted('todo-9'));
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
