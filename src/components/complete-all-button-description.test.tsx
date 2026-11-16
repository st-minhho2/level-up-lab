import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import { CompleteAllButton } from './complete-all-button';

const actions = vi.hoisted(() => ({
  completeAllTodosAction: vi.fn(),
}));
vi.mock('@/actions/complete-all', () => actions);

type CompleteAllResult = ActionResult<{ updated: number }>;

const MESSAGE = 'Could not save, try again';

function completed(updated: number): CompleteAllResult {
  return { ok: true, data: { updated } };
}

// §10: the failure result the action reports when the mark-all fails.
function saveFailed(): CompleteAllResult {
  return { ok: false, fieldErrors: { form: [MESSAGE] } };
}

// A failed result that carries no `form` message (REQ-52.2).
function failedWithoutForm(): CompleteAllResult {
  return { ok: false, fieldErrors: {} };
}

// Settlers of the hand-settled promises the running test created. React entangles pending async transitions, so a
// test that fails before settling its promise would keep the next test's button pending; afterEach settles them.
let unsettled: ((value: CompleteAllResult) => void)[] = [];

// A promise the test settles by hand, so "the result is shown" is a point the test controls.
function deferred(): { promise: Promise<CompleteAllResult>; resolve: (value: CompleteAllResult) => void } {
  let resolve: (value: CompleteAllResult) => void = () => undefined;
  const promise = new Promise<CompleteAllResult>((settle) => {
    resolve = settle;
  });
  unsettled.push(resolve);
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  unsettled = [];
});

afterEach(() => {
  for (const settle of unsettled) settle(completed(0));
});

// Renders the button, fails the first attempt, then starts a second attempt the test holds; returns the pending state.
async function failThenHoldRetry(): Promise<{
  button: HTMLElement;
  firstAlertId: string;
  retry: { resolve: (value: CompleteAllResult) => void };
  unmount: () => void;
}> {
  const retry = deferred();
  actions.completeAllTodosAction.mockResolvedValueOnce(saveFailed()).mockReturnValueOnce(retry.promise);
  const user = userEvent.setup();
  const { unmount } = render(<CompleteAllButton disabled={false} count={1} />);
  const button = screen.getByRole('button', { name: 'Mark all complete (1)' });
  await user.click(button);
  await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
  const firstAlertId = screen.getByRole('alert').id;
  await user.click(button);
  await waitFor(() => expect(button).toBeDisabled());
  return { button, firstAlertId, retry, unmount };
}

// The failure is shown and is the button's description: one alert, its non-empty id is the button's aria-describedby.
function expectDescribedByOneAlert(button: HTMLElement, alertId: string): void {
  expect(screen.getAllByRole('alert')).toHaveLength(1);
  const alert = screen.getByRole('alert');
  expect(alert.textContent).toBe(MESSAGE);
  expect(alert.id).not.toBe('');
  expect(alert.id).toBe(alertId);
  expect(button.getAttribute('aria-describedby')).toBe(alert.id);
  expect(button).toHaveAccessibleDescription(MESSAGE);
}

describe('<CompleteAllButton> failure description (§52)', () => {
  it('AC-52.1: after the failure exactly 1 alert reads "Could not save, try again"; the button "Mark all complete (1)", enabled, has aria-describedby equal to the alert\'s non-empty id and the description is the message; the alert is its next sibling; the action was called once with 0 arguments', async () => {
    actions.completeAllTodosAction.mockResolvedValueOnce(saveFailed());
    const user = userEvent.setup();
    render(<CompleteAllButton disabled={false} count={1} />);
    const button = screen.getByRole('button', { name: 'Mark all complete (1)' });

    await user.click(button);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe(MESSAGE);
    expect(screen.getByRole('button', { name: 'Mark all complete (1)' })).toBe(button);
    expect(alert.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(alert.id);
    expect(button).toHaveAccessibleDescription(MESSAGE);
    expect(button).toBeEnabled();
    expect(button.nextElementSibling).toBe(alert);
    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(1);
    expect(actions.completeAllTodosAction.mock.calls[0]).toEqual([]);
  });

  it('AC-52.3: after the failed first click aria-describedby is the alert\'s id; after the successful second result 0 alerts, no aria-describedby, description "", the button still "Mark all complete (1)" and enabled; the action was called twice', async () => {
    const second = deferred();
    actions.completeAllTodosAction.mockResolvedValueOnce(saveFailed()).mockReturnValueOnce(second.promise);
    const user = userEvent.setup();
    render(<CompleteAllButton disabled={false} count={1} />);
    const button = screen.getByRole('button', { name: 'Mark all complete (1)' });

    await user.click(button);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));

    const alert = screen.getByRole('alert');
    expect(alert.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(alert.id);

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    second.resolve(completed(1));
    await waitFor(() => expect(button).toBeEnabled());

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(button).toHaveAccessibleDescription('');
    expect(button).toHaveAccessibleName('Mark all complete (1)');
    expect(button).toBeEnabled();
    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(2);
  });

  it('AC-52.4: while a retry is pending the button is disabled and still described by the same one alert; a retry that fails keeps the same alert, id and description; a retry that succeeds leaves 0 alerts, no aria-describedby and description ""', async () => {
    const failing = await failThenHoldRetry();

    expect(failing.button).toBeDisabled();
    expectDescribedByOneAlert(failing.button, failing.firstAlertId);

    failing.retry.resolve(saveFailed());
    await waitFor(() => expect(failing.button).toBeEnabled());

    expectDescribedByOneAlert(failing.button, failing.firstAlertId);

    failing.unmount();
    const succeeding = await failThenHoldRetry();

    expect(succeeding.button).toBeDisabled();
    expectDescribedByOneAlert(succeeding.button, succeeding.firstAlertId);

    succeeding.retry.resolve(completed(1));
    await waitFor(() => expect(succeeding.button).toBeEnabled());

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(succeeding.button.hasAttribute('aria-describedby')).toBe(false);
    expect(succeeding.button).toHaveAccessibleDescription('');
  });

  it('AC-52.2: before any attempt the button "Mark all complete (2)" has no aria-describedby attribute, description "", 0 alert roles and no element with an id in the container', () => {
    const { container } = render(<CompleteAllButton disabled={false} count={2} />);

    const button = screen.getByRole('button', { name: 'Mark all complete (2)' });
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(button).toHaveAccessibleDescription('');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(container.querySelectorAll('[id]')).toHaveLength(0);
    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(0);
  });

  it('AC-52.5: after the failure, a render with disabled true and count 0 leaves 0 child nodes and 0 alerts; the button that comes back is "Mark all complete (1)", enabled, with no aria-describedby, description "" and 0 alerts; the action was called once', async () => {
    actions.completeAllTodosAction.mockResolvedValueOnce(saveFailed());
    const user = userEvent.setup();
    const { container, rerender } = render(<CompleteAllButton disabled={false} count={1} />);
    await user.click(screen.getByRole('button', { name: 'Mark all complete (1)' }));
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    expect(screen.getByRole('alert').textContent).toBe(MESSAGE);

    rerender(<CompleteAllButton disabled={true} count={0} />);

    expect(container.childNodes).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);

    rerender(<CompleteAllButton disabled={false} count={1} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    const button = screen.getByRole('button', { name: 'Mark all complete (1)' });
    expect(button).toBeEnabled();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(button).toHaveAccessibleDescription('');
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(1);
  });

  it('AC-52.6: a failure without a form message shows 0 alerts and no element with an id; the button "Mark all complete (1)", enabled, has no aria-describedby and description ""', async () => {
    const action = deferred();
    actions.completeAllTodosAction.mockReturnValueOnce(action.promise);
    const user = userEvent.setup();
    const { container } = render(<CompleteAllButton disabled={false} count={1} />);
    const button = screen.getByRole('button', { name: 'Mark all complete (1)' });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    action.resolve(failedWithoutForm());
    await waitFor(() => expect(button).toBeEnabled());

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(container.querySelectorAll('[id]')).toHaveLength(0);
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    expect(button).toHaveAccessibleDescription('');
    expect(button).toHaveAccessibleName('Mark all complete (1)');
    expect(button).toBeEnabled();
    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(1);
  });
});
