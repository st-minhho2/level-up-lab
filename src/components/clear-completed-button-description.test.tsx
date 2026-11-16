import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import { ClearCompletedButton } from './clear-completed-button';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
  clearCompletedTodosAction: vi.fn(),
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);

type ClearResult = ActionResult<{ deleted: number }>;

const MESSAGE = 'Could not save, try again';

function cleared(deleted: number): ClearResult {
  return { ok: true, data: { deleted } };
}

function saveFailed(): ClearResult {
  return { ok: false, fieldErrors: { form: [MESSAGE] } };
}

// A promise the test settles by hand, so "the result settles" is a point the test controls.
function deferred(): { promise: Promise<ClearResult>; resolve: (value: ClearResult) => void } {
  let resolve: (value: ClearResult) => void = () => undefined;
  const promise = new Promise<ClearResult>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<ClearCompletedButton> failure description (§49)', () => {
  it('AC-49.2: after the second result 0 alerts, no aria-describedby and description "", the name stays "Clear completed (2)" throughout, and the action was called twice with 0 arguments', async () => {
    const second = deferred();
    actions.clearCompletedTodosAction.mockResolvedValueOnce(saveFailed()).mockReturnValueOnce(second.promise);
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} completedCount={2} />);
    const button = screen.getByRole('button', { name: 'Clear completed (2)' });

    await user.click(button);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));

    expect(button).toHaveAccessibleName('Clear completed (2)');

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    second.resolve(cleared(2));
    await waitFor(() => expect(button).toBeEnabled());

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).toHaveAccessibleDescription('');
    expect(button).toHaveAccessibleName('Clear completed (2)');
    expect(actions.clearCompletedTodosAction).toHaveBeenCalledTimes(2);
    expect(actions.clearCompletedTodosAction.mock.calls).toEqual([[], []]);
  });

  it('AC-49.5: a success leaves the button named exactly "Clear completed" with no aria-describedby, description "", 0 alerts and 0 status roles, and the action was called once with 0 arguments', async () => {
    const action = deferred();
    actions.clearCompletedTodosAction.mockReturnValueOnce(action.promise);
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} />);
    const button = screen.getByRole('button', { name: 'Clear completed' });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(cleared(1));
    await waitFor(() => expect(button).toBeEnabled());

    expect(button).toHaveAccessibleName('Clear completed');
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).toHaveAccessibleDescription('');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(screen.queryAllByRole('status')).toHaveLength(0);
    expect(actions.clearCompletedTodosAction).toHaveBeenCalledTimes(1);
    expect(actions.clearCompletedTodosAction.mock.calls[0]).toEqual([]);
  });
});
