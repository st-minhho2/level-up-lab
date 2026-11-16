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

// "Renders no element, no wrapper, no text and no failure message" (REQ-43.1), measured on the render container.
function expectRendersNothing(container: HTMLElement): void {
  expect(container.childNodes).toHaveLength(0);
  expect(screen.queryAllByRole('button')).toHaveLength(0);
  expect(screen.queryAllByRole('alert')).toHaveLength(0);
  expect(container.textContent).toBe('');
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<CompleteAllButton> hidden with nothing to mark (§43)', () => {
  it('AC-43.1: with disabled true and no count, and with disabled true and count 0, the container has 0 child nodes, 0 button and 0 alert roles, text "", and the action is called 0 times', () => {
    const noCount = render(<CompleteAllButton disabled={true} />);

    expectRendersNothing(noCount.container);

    noCount.unmount();
    const zeroCount = render(<CompleteAllButton disabled={true} count={0} />);

    expectRendersNothing(zeroCount.container);
    expect(actions.completeAllTodosAction).toHaveBeenCalledTimes(0);
  });

  // REQ-43.2 restates §14's pending behavior, which already holds; this guards it against the §43 change.
  it('AC-43.2: while pending exactly 1 button named "Mark all complete (2)", disabled; after a successful result with the props unchanged the same single button is still there, named "Mark all complete (2)", enabled again', async () => {
    const action = deferred();
    actions.completeAllTodosAction.mockReturnValue(action.promise);
    const user = userEvent.setup();
    render(<CompleteAllButton disabled={false} count={2} />);
    const button = screen.getByRole('button', { name: 'Mark all complete (2)' });

    await user.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete (2)' })).toBe(button);

    action.resolve(completed(2));

    await waitFor(() => expect(button).toBeEnabled());
    expect(button.isConnected).toBe(true);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete (2)' })).toBe(button);
  });

  it('AC-43.3: a failure alert is gone once rendered with disabled true (0 child nodes, 0 button, 0 alert roles) and does not come back with the button: exactly 1 enabled "Mark all complete (1)" and 0 alert roles', async () => {
    actions.completeAllTodosAction.mockResolvedValue(saveFailed());
    const user = userEvent.setup();
    const { container, rerender } = render(<CompleteAllButton disabled={false} count={1} />);
    await user.click(screen.getByRole('button', { name: 'Mark all complete (1)' }));
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    expect(screen.getByRole('alert').textContent).toBe('Could not save, try again');

    rerender(<CompleteAllButton disabled={true} count={0} />);

    expect(container.childNodes).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);

    rerender(<CompleteAllButton disabled={false} count={1} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete (1)' })).toBeEnabled();
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('AC-43.4: after the focused button is removed there are 0 button roles, document.activeElement is document.body, focus() is called 0 times after the click and no element has a tabindex attribute', async () => {
    actions.completeAllTodosAction.mockResolvedValue(completed(1));
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    const user = userEvent.setup();
    const { rerender } = render(<CompleteAllButton disabled={false} count={1} />);
    const button = screen.getByRole('button', { name: 'Mark all complete (1)' });
    await user.click(button);
    await waitFor(() => expect(button).toBeEnabled());
    // The Given: the clicked button holds focus when it is removed, whatever the pending state did to focus meanwhile.
    // The test's own call is cleared from the spy below; only calls by the component during the removal count.
    button.focus();
    expect(document.activeElement).toBe(button);
    focusSpy.mockClear();

    rerender(<CompleteAllButton disabled={true} count={0} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(document.activeElement).toBe(document.body);
    expect(focusSpy).toHaveBeenCalledTimes(0);
    expect(document.querySelectorAll('[tabindex]')).toHaveLength(0);
  });
});
