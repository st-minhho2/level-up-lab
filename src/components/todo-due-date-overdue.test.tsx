import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import type { Todo } from '@/lib/todos';
import { TodoDueDate } from './todo-due-date';

const actions = vi.hoisted(() => ({
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);

function todo(dueDate: string | undefined): Todo {
  return { id: 'todo-9', title: 'Walk the dog', completed: false, createdAt: new Date(2026, 0, 1), dueDate };
}

function saved(dueDate: string | undefined): ActionResult<Todo> {
  return { ok: true, data: todo(dueDate) };
}

// The local noon of 2026-11-01, so "today" is 2026-11-01 in whatever zone the runner uses.
function firstOfNovember(): Date {
  return new Date(2026, 10, 1, 12, 0, 0);
}

// A row as §7 builds it: the first checkbox of the nearest `li` is the completed state (§17).
function Row({ checked, dueDate }: { readonly checked: boolean; readonly dueDate: string | undefined }): ReactNode {
  return (
    <li>
      <input type="checkbox" checked={checked} readOnly />
      <TodoDueDate todoId="todo-9" dueDate={dueDate} />
    </li>
  );
}

function listContainer(): HTMLElement {
  return document.body.appendChild(document.createElement('ul'));
}

function overdueCount(scope: HTMLElement = document.body): number {
  return within(scope).queryAllByText('Overdue').length;
}

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(firstOfNovember());
});

afterEach(() => {
  vi.useRealTimers();
});

describe('<TodoDueDate> overdue marker (§17)', () => {
  it('AC-17.3: (a) shows exactly 1 "Overdue" after "Due 2026-10-31", without role, aria-label or button; (b), (c), (d) show 0 and (d) has text ""; each has 1 "Edit due date" button and 0 alerts', () => {
    const shown: Record<string, { overdue: number; buttons: number; alerts: number }> = {};
    let textWithoutDate: string | null = 'not rendered';

    for (const [name, dueDate] of [
      ['a', '2026-10-31'],
      ['b', '2026-11-01'],
      ['c', '2026-11-02'],
      ['d', undefined],
    ] as const) {
      const { container, unmount } = render(<TodoDueDate todoId="todo-9" dueDate={dueDate} />);
      shown[name] = {
        overdue: overdueCount(container),
        buttons: within(container).getAllByRole('button', { name: 'Edit due date' }).length,
        alerts: within(container).queryAllByRole('alert').length,
      };
      if (name === 'd') {
        textWithoutDate = container.textContent;
      }
      if (name === 'a') {
        expect(within(container).getAllByText('Due 2026-10-31')).toHaveLength(1);
        const due = within(container).getByText('Due 2026-10-31');
        const overdue = within(container).queryByText('Overdue');
        expect(overdue).not.toBeNull();
        if (overdue !== null) {
          expect(due.compareDocumentPosition(overdue) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
          );
          expect(overdue).not.toHaveAttribute('role');
          expect(overdue).not.toHaveAttribute('aria-label');
          expect(overdue.closest('button')).toBeNull();
        }
      }
      unmount();
    }

    expect(shown).toEqual({
      a: { overdue: 1, buttons: 1, alerts: 0 },
      b: { overdue: 0, buttons: 1, alerts: 0 },
      c: { overdue: 0, buttons: 1, alerts: 0 },
      d: { overdue: 0, buttons: 1, alerts: 0 },
    });
    expect(textWithoutDate).toBe('');
  });

  it('AC-17.4: inside an li with a checked box shows 0 "Overdue", unchecked exactly 1, checked again 0; outside any li it is shown', () => {
    const { container, rerender } = render(<Row checked dueDate="2026-10-31" />, { container: listContainer() });
    const counts: number[] = [];

    expect(within(container).getAllByText('Due 2026-10-31')).toHaveLength(1);
    expect(container.textContent).not.toContain('Overdue');
    counts.push(overdueCount(container));
    rerender(<Row checked={false} dueDate="2026-10-31" />);
    counts.push(overdueCount(container));
    rerender(<Row checked dueDate="2026-10-31" />);
    counts.push(overdueCount(container));
    const outside = render(<TodoDueDate todoId="todo-9" dueDate="2026-10-31" />);
    counts.push(overdueCount(outside.container));

    expect(counts).toEqual([0, 1, 0, 1]);
    expect(within(container).getAllByText('Due 2026-10-31')).toHaveLength(1);
  });

  it('AC-17.5: renderToString gives identical markup on 2026-11-01 and 2030-01-01 with "Due 2026-10-31" once and no "Overdue"; hydrating it calls onRecoverableError 0 times and then shows exactly 1 "Overdue"', async () => {
    const element = <TodoDueDate todoId="todo-9" dueDate="2026-10-31" />;
    const first = renderToString(element);
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const second = renderToString(element);
    vi.setSystemTime(firstOfNovember());
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = first;
    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    onTestFinished(() => {
      act(() => root?.unmount());
      host.remove();
    });

    await act(async () => {
      root = hydrateRoot(host, element, { onRecoverableError });
      await Promise.resolve();
    });

    expect(second).toBe(first);
    expect(occurrences(first, 'Due 2026-10-31')).toBe(1);
    expect(occurrences(first, 'Overdue')).toBe(0);
    expect(onRecoverableError).toHaveBeenCalledTimes(0);
    expect(overdueCount(host)).toBe(1);
  });

  it('AC-17.6: hides "Overdue" while editing, shows exactly 1 after "Update due date", 0 for 2026-11-02; for 2026-11-01 keeps 0 across midnight on a same-props re-render and shows 1 on a fresh render', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(saved('2026-10-31'));
    const user = userEvent.setup();
    const { rerender, unmount } = render(<TodoDueDate todoId="todo-9" dueDate="2026-10-31" />);

    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
    expect(overdueCount()).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Update due date' }));

    await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
    expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '2026-10-31']]);
    expect(overdueCount()).toBe(1);

    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-02" />);

    expect(overdueCount()).toBe(0);

    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-01" />);
    const beforeMidnight = overdueCount();
    vi.setSystemTime(new Date(2026, 10, 2, 0, 0, 1));
    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-01" />);
    const sameProps = overdueCount();
    unmount();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-01" />);
    const fresh = overdueCount();

    expect([beforeMidnight, sameProps, fresh]).toEqual([0, 0, 1]);
  });
});
