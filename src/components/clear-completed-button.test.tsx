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
}));
vi.mock('@/actions/todos', () => actions);

type ClearResult = ActionResult<{ deleted: number }>;

function cleared(deleted: number): ClearResult {
  return { ok: true, data: { deleted } };
}

// A promise the test settles by hand, so the button can be observed while the action is still pending.
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

describe('<ClearCompletedButton> (§9)', () => {
  it('AC-9.2: renders a disabled button named "Clear completed" when disabled', () => {
    render(<ClearCompletedButton disabled={true} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled();
  });

  it('AC-9.2: renders an enabled button named "Clear completed" when enabled', () => {
    render(<ClearCompletedButton disabled={false} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeEnabled();
  });

  it('AC-9.2: stays disabled while the action is pending and is enabled again once it resolves', async () => {
    const action = deferred();
    actions.clearCompletedTodosAction.mockReturnValue(action.promise);
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} />);

    const button = screen.getByRole('button', { name: 'Clear completed' });
    await user.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(cleared(1));
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('AC-9.3: calls clearCompletedTodosAction once on click', async () => {
    actions.clearCompletedTodosAction.mockResolvedValue(cleared(1));
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} />);

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));

    expect(actions.clearCompletedTodosAction).toHaveBeenCalledTimes(1);
    expect(actions.clearCompletedTodosAction).toHaveBeenCalledWith();
  });
});
