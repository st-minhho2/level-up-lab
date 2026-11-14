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

function cleared(deleted: number): ClearResult {
  return { ok: true, data: { deleted } };
}

// A promise the test settles by hand, so "once it resolves" is a point the test controls.
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

describe('<ClearCompletedButton> count (§32)', () => {
  it('AC-32.2: renders 1 button named exactly "Clear completed (3)", enabled, with 0 status and 0 alert roles', () => {
    render(<ClearCompletedButton disabled={false} completedCount={3} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed (3)' })).toBeEnabled();
    expect(screen.queryAllByRole('status')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('AC-32.3: renders 1 button named exactly "Clear completed" each time, disabled with completedCount 0 and enabled with no completedCount', () => {
    const first = render(<ClearCompletedButton disabled={true} completedCount={0} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled();

    first.unmount();
    render(<ClearCompletedButton disabled={false} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeEnabled();
  });

  it('AC-32.4: calls clearCompletedTodosAction once with 0 arguments and, once it resolves, the name is still "Clear completed (2)" with 0 status, 0 alert roles and no text containing "deleted"', async () => {
    const action = deferred();
    actions.clearCompletedTodosAction.mockReturnValue(action.promise);
    const user = userEvent.setup();
    const { container } = render(<ClearCompletedButton disabled={false} completedCount={2} />);
    const button = screen.getByRole('button', { name: 'Clear completed (2)' });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(cleared(2));
    await waitFor(() => expect(button).toBeEnabled());

    expect(actions.clearCompletedTodosAction).toHaveBeenCalledTimes(1);
    expect(actions.clearCompletedTodosAction.mock.calls[0]).toEqual([]);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed (2)' })).toBe(button);
    expect(screen.queryAllByRole('status')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/deleted/i);
  });
});
