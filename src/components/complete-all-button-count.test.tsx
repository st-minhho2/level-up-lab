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

// A promise the test settles by hand, so "once it resolves" is a point the test controls.
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

describe('<CompleteAllButton> count (§36)', () => {
  it('AC-36.2: renders 1 button named exactly "Mark all complete (3)", enabled, with 0 status and 0 alert roles', () => {
    render(<CompleteAllButton disabled={false} count={3} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete (3)' })).toBeEnabled();
    expect(screen.queryAllByRole('status')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('AC-36.3: renders 1 button named exactly "Mark all complete" each time, disabled with count 0 and enabled with no count', () => {
    const first = render(<CompleteAllButton disabled={true} count={0} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete' })).toBeDisabled();

    first.unmount();
    render(<CompleteAllButton disabled={false} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete' })).toBeEnabled();
  });

  it('AC-36.4: calls completeAllTodosAction once with 0 arguments and, once it resolves, the name is still "Mark all complete (2)" with 0 status, 0 alert roles and no text containing "changed" or "updated"', async () => {
    const action = deferred();
    actions.completeAllTodosAction.mockReturnValue(action.promise);
    const user = userEvent.setup();
    const { container } = render(<CompleteAllButton disabled={false} count={2} />);
    const button = screen.getByRole('button', { name: 'Mark all complete (2)' });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(completed(2));
    await waitFor(() => expect(button).toBeEnabled());

    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(1);
    expect(actions.completeAllTodosAction.mock.calls[0]).toEqual([]);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete (2)' })).toBe(button);
    expect(screen.queryAllByRole('status')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/changed|updated/i);
  });
});
