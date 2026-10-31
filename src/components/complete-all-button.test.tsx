import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import { CompleteAllButton } from './complete-all-button';

const actions = vi.hoisted(() => ({
  completeAllTodosAction: vi.fn(),
}));
vi.mock('@/actions/complete-all', () => actions);

type CompleteAllResult = ActionResult<{ updated: number }>;

function completed(updated: number): CompleteAllResult {
  return { ok: true, data: { updated } };
}

// §10: the failure result the action reports when the mark-all fails.
function saveFailed(): CompleteAllResult {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
}

// A promise the test settles by hand, so the button can be observed while the action is still pending.
function deferred(): { promise: Promise<CompleteAllResult>; resolve: (value: CompleteAllResult) => void } {
  let resolve: (value: CompleteAllResult) => void = () => undefined;
  const promise = new Promise<CompleteAllResult>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<CompleteAllButton> (§14)', () => {
  it('AC-14.4: (a) renders exactly 1 button named "Mark all complete", disabled, when disabled is true', () => {
    render(<CompleteAllButton disabled={true} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Mark all complete' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete' })).toBeDisabled();
  });

  it('AC-14.4: (b) renders exactly 1 enabled button, calls the action once with 0 arguments, is disabled while it is pending and enabled again once it resolves', async () => {
    const action = deferred();
    actions.completeAllTodosAction.mockReturnValue(action.promise);
    const user = userEvent.setup();
    render(<CompleteAllButton disabled={false} />);
    expect(screen.getAllByRole('button', { name: 'Mark all complete' })).toHaveLength(1);
    const button = screen.getByRole('button', { name: 'Mark all complete' });
    expect(button).toBeEnabled();

    await user.click(button);

    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(1);
    expect(actions.completeAllTodosAction.mock.calls[0]).toEqual([]);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(completed(1));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('AC-14.5: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success', async () => {
    actions.completeAllTodosAction.mockResolvedValueOnce(saveFailed()).mockResolvedValueOnce(completed(2));
    const user = userEvent.setup();
    render(<CompleteAllButton disabled={false} />);
    const button = screen.getByRole('button', { name: 'Mark all complete' });

    await user.click(button);

    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Could not save, try again');
    expect(alert.parentElement).toBe(button.parentElement);
    expect(button.nextElementSibling).toBe(alert);
    await waitFor(() => expect(button).toBeEnabled());

    // REQ-14.10: the next successful attempt on the same button removes the message.
    await user.click(button);

    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0));
  });
});
