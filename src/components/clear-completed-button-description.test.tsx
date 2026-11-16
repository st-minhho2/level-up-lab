import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

// Settlers of the hand-settled promises the running test created. React entangles pending async transitions, so a
// test that fails before settling its promise would keep the next test's button pending; afterEach settles them.
let unsettled: ((value: ClearResult) => void)[] = [];

// A promise the test settles by hand, so "the result settles" is a point the test controls.
function deferred(): { promise: Promise<ClearResult>; resolve: (value: ClearResult) => void } {
  let resolve: (value: ClearResult) => void = () => undefined;
  const promise = new Promise<ClearResult>((settle) => {
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
  for (const settle of unsettled) settle(cleared(0));
});

describe('<ClearCompletedButton> failure description (§49)', () => {
  it('AC-49.1: no aria-describedby and description "" after the render; after the failure the button "Clear completed (2)", enabled, has aria-describedby equal to the one alert\'s id and the description is exactly "Could not save, try again"', async () => {
    actions.clearCompletedTodosAction.mockResolvedValueOnce(saveFailed());
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} completedCount={2} />);
    const button = screen.getByRole('button', { name: 'Clear completed (2)' });

    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).toHaveAccessibleDescription('');

    await user.click(button);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe(MESSAGE);
    expect(screen.getByRole('button', { name: 'Clear completed (2)' })).toBe(button);
    expect(button).toBeEnabled();
    expect(alert.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(alert.id);
    expect(button).toHaveAccessibleDescription(MESSAGE);
  });

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

  it('AC-49.3: while a retry is pending the button is disabled, exactly 1 alert reads "Could not save, try again", aria-describedby is still its id and the description is the message; after the success 0 alerts, no aria-describedby, description ""', async () => {
    const retry = deferred();
    actions.clearCompletedTodosAction.mockResolvedValueOnce(saveFailed()).mockReturnValueOnce(retry.promise);
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} completedCount={2} />);
    const button = screen.getByRole('button', { name: 'Clear completed (2)' });
    await user.click(button);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe(MESSAGE);
    expect(alert.id).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(alert.id);
    expect(button).toHaveAccessibleDescription(MESSAGE);

    retry.resolve(cleared(1));
    await waitFor(() => expect(button).toBeEnabled());

    expect(screen.queryAllByRole('alert')).toHaveLength(0);
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).toHaveAccessibleDescription('');
  });

  it('AC-49.4: after each of two failures exactly 1 alert shows and the description equals its text; the aria-describedby after the second failure equals the one after the first and is not ""', async () => {
    const second = deferred();
    actions.clearCompletedTodosAction.mockResolvedValueOnce(saveFailed()).mockReturnValueOnce(second.promise);
    const user = userEvent.setup();
    render(<ClearCompletedButton disabled={false} completedCount={2} />);
    const button = screen.getByRole('button', { name: 'Clear completed (2)' });

    await user.click(button);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));
    const firstAlert = screen.getByRole('alert');
    expect(button).toHaveAccessibleDescription(firstAlert.textContent ?? '');
    expect(button).toHaveAccessibleDescription(MESSAGE);
    const firstDescribedBy = button.getAttribute('aria-describedby');

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    second.resolve(saveFailed());
    await waitFor(() => expect(button).toBeEnabled());

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    const secondAlert = screen.getByRole('alert');
    expect(secondAlert.textContent).toBe(MESSAGE);
    expect(button).toHaveAccessibleDescription(MESSAGE);
    expect(firstDescribedBy).not.toBeNull();
    expect(firstDescribedBy).not.toBe('');
    expect(button.getAttribute('aria-describedby')).toBe(firstDescribedBy);
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

  it('AC-49.6: with two buttons, the failed "Clear completed (2)" is described by the one alert and "Clear completed (1)" has no aria-describedby and description ""; 1 alert in the document and all ids in the container are distinct', async () => {
    actions.clearCompletedTodosAction.mockResolvedValue(saveFailed());
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <ClearCompletedButton disabled={false} completedCount={1} />
        <ClearCompletedButton disabled={false} completedCount={2} />
      </div>,
    );
    const first = screen.getByRole('button', { name: 'Clear completed (1)' });
    const second = screen.getByRole('button', { name: 'Clear completed (2)' });

    await user.click(second);
    await waitFor(() => expect(screen.queryAllByRole('alert')).toHaveLength(1));

    const alert = screen.getByRole('alert');
    expect(alert.id).not.toBe('');
    expect(second.getAttribute('aria-describedby')).toBe(alert.id);
    expect(second).toHaveAccessibleDescription(MESSAGE);
    expect(first).not.toHaveAttribute('aria-describedby');
    expect(first).toHaveAccessibleDescription('');
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
    const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
