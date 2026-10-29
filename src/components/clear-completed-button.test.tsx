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

// §10: the failure result the action reports when the lib call fails.
function saveFailed(): ClearResult {
  return { ok: false, fieldErrors: { form: ['Could not save, try again'] } };
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

describe('<ClearCompletedButton> when the mutation fails (§10)', () => {
  it('AC-10.3: shows exactly one alert "Could not save, try again" right after the button and leaves it enabled when the action fails, then removes it on the next success', async () => {
    actions.clearCompletedTodosAction.mockResolvedValueOnce(saveFailed()).mockResolvedValueOnce(cleared(1));
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} />);
    const button = screen.getByRole('button', { name: 'Clear completed' });

    await user.click(button);

    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Could not save, try again');
    expect(alert.parentElement).toBe(button.parentElement);
    expect(button.nextElementSibling).toBe(alert);
    expect(button).toBeEnabled();

    // REQ-10.5: the next successful attempt on the same control removes the message.
    await user.click(button);

    expect(actions.clearCompletedTodosAction).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(0));
  });
});
