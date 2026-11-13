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

// A row as §7 builds it: the first checkbox of the nearest `li` is the completed state (§17, §31).
function Row({ checked }: { readonly checked: boolean }): ReactNode {
  return (
    <li>
      <input type="checkbox" checked={checked} readOnly />
      <TodoDueDate todoId="todo-9" dueDate="2026-11-01" />
    </li>
  );
}

function listContainer(): HTMLElement {
  return document.body.appendChild(document.createElement('ul'));
}

function dueTodayCount(scope: HTMLElement = document.body): number {
  return within(scope).queryAllByText('Due today').length;
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

describe('<TodoDueDate> due-today marker (§31)', () => {
  it('AC-31.2: (a) shows exactly 1 "Due today" after the single "Due 2026-11-01", 0 "Overdue", without role, aria-label or button; (b), (c), (d) show 0 and (d) has text ""; each has 1 "Edit due date" button and 0 alerts', () => {
    const shown: Record<string, { dueToday: number; buttons: number; alerts: number }> = {};
    let textWithoutDate: string | null = 'not rendered';

    for (const [name, dueDate] of [
      ['a', '2026-11-01'],
      ['b', '2026-10-31'],
      ['c', '2026-11-02'],
      ['d', undefined],
    ] as const) {
      const { container, unmount } = render(<TodoDueDate todoId="todo-9" dueDate={dueDate} />);
      shown[name] = {
        dueToday: dueTodayCount(container),
        buttons: within(container).getAllByRole('button', { name: 'Edit due date' }).length,
        alerts: within(container).queryAllByRole('alert').length,
      };
      if (name === 'd') {
        textWithoutDate = container.textContent;
      }
      if (name === 'a') {
        expect(within(container).getAllByText('Due 2026-11-01')).toHaveLength(1);
        expect(within(container).queryAllByText('Overdue')).toHaveLength(0);
        const due = within(container).getByText('Due 2026-11-01');
        const dueToday = within(container).queryByText('Due today');
        expect(dueToday).not.toBeNull();
        if (dueToday !== null) {
          expect(due.compareDocumentPosition(dueToday) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING,
          );
          expect(dueToday).not.toHaveAttribute('role');
          expect(dueToday).not.toHaveAttribute('aria-label');
          expect(dueToday.closest('button')).toBeNull();
        }
      }
      unmount();
    }

    expect(shown).toEqual({
      a: { dueToday: 1, buttons: 1, alerts: 0 },
      b: { dueToday: 0, buttons: 1, alerts: 0 },
      c: { dueToday: 0, buttons: 1, alerts: 0 },
      d: { dueToday: 0, buttons: 1, alerts: 0 },
    });
    expect(textWithoutDate).toBe('');
  });

  it('AC-31.3: inside an li with a checked box shows 0 "Due today" and "Due 2026-11-01" once, unchecked exactly 1, checked again 0', () => {
    const { container, rerender } = render(<Row checked />, { container: listContainer() });
    const counts: number[] = [];

    expect(within(container).getAllByText('Due 2026-11-01')).toHaveLength(1);
    counts.push(dueTodayCount(container));
    rerender(<Row checked={false} />);
    counts.push(dueTodayCount(container));
    rerender(<Row checked />);
    counts.push(dueTodayCount(container));

    expect(counts).toEqual([0, 1, 0]);
  });

  it('AC-31.4: renderToString gives identical markup on 2026-11-01 and 2030-01-01 with "Due 2026-11-01" once and no "Due today"; hydrating it calls onRecoverableError 0 times and then shows exactly 1 "Due today"', async () => {
    const element = <TodoDueDate todoId="todo-9" dueDate="2026-11-01" />;
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
    expect(occurrences(first, 'Due 2026-11-01')).toBe(1);
    expect(occurrences(first, 'Due today')).toBe(0);
    expect(onRecoverableError).toHaveBeenCalledTimes(0);
    expect(dueTodayCount(host)).toBe(1);
  });

  it('AC-31.5: shows 0 "Due today" before, while and after editing 2026-11-02, exactly 1 after the re-render with 2026-11-01; for 2026-11-01 keeps 1 across midnight on a same-props re-render and shows 0 on a fresh render', async () => {
    actions.setTodoDueDateAction.mockResolvedValue(saved('2026-11-02'));
    const user = userEvent.setup();
    const { rerender, unmount } = render(<TodoDueDate todoId="todo-9" dueDate="2026-11-02" />);

    expect(dueTodayCount()).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Edit due date' }));

    expect(screen.getAllByLabelText('Due date')).toHaveLength(1);
    expect(dueTodayCount()).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Update due date' }));

    await waitFor(() => expect(screen.queryAllByLabelText('Due date')).toHaveLength(0));
    expect(actions.setTodoDueDateAction.mock.calls).toEqual([['todo-9', '2026-11-02']]);
    expect(screen.getAllByText('Due 2026-11-02')).toHaveLength(1);
    expect(dueTodayCount()).toBe(0);

    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-01" />);

    expect(dueTodayCount()).toBe(1);

    const beforeMidnight = dueTodayCount();
    vi.setSystemTime(new Date(2026, 10, 2, 0, 0, 1));
    rerender(<TodoDueDate todoId="todo-9" dueDate="2026-11-01" />);
    const sameProps = dueTodayCount();
    unmount();
    render(<TodoDueDate todoId="todo-9" dueDate="2026-11-01" />);
    const fresh = dueTodayCount();

    expect([beforeMidnight, sameProps, fresh]).toEqual([1, 1, 0]);
  });
});
