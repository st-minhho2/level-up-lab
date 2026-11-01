import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import type { ActionResult } from '@/lib/action-result';
import type { Todo } from '@/lib/todos';
import { TodoItem } from './todo-item';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);
// §19: TodoItem renders DeleteTodoButton, which imports this module; mocked at the boundary like '@/actions/todos'.
const deleteActions = vi.hoisted(() => ({
  deleteTodoAction: vi.fn(),
}));
vi.mock('@/actions/delete-todo', () => deleteActions);

// AC-20.3: the open todo "Walk the dog" (id todo-1), added at 23:30 UTC on 2026-11-01.
function walkTheDog(): Todo {
  return { id: 'todo-1', title: 'Walk the dog', completed: false, createdAt: new Date(Date.UTC(2026, 10, 1, 23, 30)) };
}

function saved(todo: Todo): ActionResult<Todo> {
  return { ok: true, data: todo };
}

interface CreatedTime {
  readonly dateTime: string | null;
  readonly created: string | null;
  readonly childNodes: number;
  readonly role: string | null;
  readonly ariaLabel: string | null;
}

// Every <time> element of the row, as the attributes §20 constrains.
function createdTimes(row: HTMLElement): CreatedTime[] {
  return Array.from(row.querySelectorAll('time')).map((time) => ({
    dateTime: time.getAttribute('datetime'),
    created: time.getAttribute('data-created'),
    childNodes: time.childNodes.length,
    role: time.getAttribute('role'),
    ariaLabel: time.getAttribute('aria-label'),
  }));
}

function createdOf(day: string): CreatedTime {
  return { dateTime: day, created: `Created ${day}`, childNodes: 0, role: null, ariaLabel: null };
}

interface RowControls {
  readonly firstCheckboxIsCompletion: boolean;
  readonly checkboxes: number;
  readonly editTitle: number;
  readonly editDueDate: number;
  readonly deleteTodo: number;
}

// §17 reads the first checkbox of the <li> as the completion state; §20 must add no control before or beside it.
function controlsOf(row: HTMLElement, title: string): RowControls {
  return {
    firstCheckboxIsCompletion:
      row.querySelector('input[type="checkbox"]') === within(row).queryByRole('checkbox', { name: title }),
    checkboxes: within(row).queryAllByRole('checkbox').length,
    editTitle: within(row).queryAllByRole('button', { name: 'Edit title' }).length,
    editDueDate: within(row).queryAllByRole('button', { name: 'Edit due date' }).length,
    deleteTodo: within(row).queryAllByRole('button', { name: 'Delete todo' }).length,
  };
}

function occurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

let originalTz: string | undefined;

beforeEach(() => {
  vi.resetAllMocks();
  originalTz = process.env.TZ;
});

afterEach(() => {
  vi.useRealTimers();
  if (originalTz === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTz;
  }
});

describe('<TodoItem> creation date (§20)', () => {
  it('AC-20.3: in view and edit mode the li holds exactly 1 empty time with datetime 2026-11-01 and data-created "Created 2026-11-01", no role or aria-label; view-mode text is exactly "Walk the dog"; the first and only checkbox is the completion checkbox; exactly 1 "Edit title" (view), 1 "Edit due date" and 1 "Delete todo" button', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={walkTheDog()} />);
    const row = screen.getByRole('listitem');
    const viewTimes = createdTimes(row);
    const viewText = row.textContent;
    const viewControls = controlsOf(row, 'Walk the dog');

    await user.click(within(row).getByRole('button', { name: 'Edit title' }));

    const editTimes = createdTimes(row);
    const editControls = controlsOf(row, 'Walk the dog');
    expect(viewTimes).toEqual([createdOf('2026-11-01')]);
    expect(editTimes).toEqual([createdOf('2026-11-01')]);
    expect(viewText).toBe('Walk the dog');
    expect(viewControls).toEqual({
      firstCheckboxIsCompletion: true,
      checkboxes: 1,
      editTitle: 1,
      editDueDate: 1,
      deleteTodo: 1,
    });
    expect({
      firstCheckboxIsCompletion: editControls.firstCheckboxIsCompletion,
      checkboxes: editControls.checkboxes,
      editDueDate: editControls.editDueDate,
      deleteTodo: editControls.deleteTodo,
    }).toEqual({ firstCheckboxIsCompletion: true, checkboxes: 1, editDueDate: 1, deleteTodo: 1 });
  });

  it('AC-20.4: renderToString under Asia/Tokyo on 2026-11-01 and America/Los_Angeles on 2030-01-01 gives identical markup with data-created="Created 2026-11-01" exactly once; hydrating it calls onRecoverableError 0 times and leaves exactly 1 time with data-created "Created 2026-11-01"', async () => {
    const element = <TodoItem todo={walkTheDog()} />;
    vi.useFakeTimers({ toFake: ['Date'] });
    process.env.TZ = 'Asia/Tokyo';
    vi.setSystemTime(new Date(2026, 10, 1, 12));
    const first = renderToString(element);
    process.env.TZ = 'America/Los_Angeles';
    vi.setSystemTime(new Date(2030, 0, 1, 12));
    const second = renderToString(element);
    const host = document.body.appendChild(document.createElement('ul'));
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
    expect(occurrences(first, 'data-created="Created 2026-11-01"')).toBe(1);
    expect(occurrences(second, 'data-created="Created 2026-11-01"')).toBe(1);
    expect(onRecoverableError).toHaveBeenCalledTimes(0);
    expect(Array.from(host.querySelectorAll('time')).map((time) => time.getAttribute('data-created'))).toEqual([
      'Created 2026-11-01',
    ]);
  });

  it('AC-20.5: after re-rendering with completed: true, title "Walk the cat" and dueDate 2026-11-05 the li still holds exactly 1 time with data-created "Created 2026-11-01"; with createdAt 2026-12-31T23:59Z exactly 1 with data-created "Created 2026-12-31" and datetime 2026-12-31; the first checkbox is the completion checkbox in every case', () => {
    const ticked: Todo = { ...walkTheDog(), completed: true };
    const renamed: Todo = { ...ticked, title: 'Walk the cat' };
    const due: Todo = { ...renamed, dueDate: '2026-11-05' };
    const recreated: Todo = { ...due, createdAt: new Date(Date.UTC(2026, 11, 31, 23, 59)) };
    actions.toggleTodoAction.mockResolvedValue(saved(ticked));
    actions.updateTodoTitleAction.mockResolvedValue(saved(renamed));
    const { rerender } = render(<TodoItem todo={walkTheDog()} />);
    const seen: { readonly times: CreatedTime[]; readonly firstCheckboxIsCompletion: boolean }[] = [];

    for (const todo of [ticked, renamed, due, recreated]) {
      rerender(<TodoItem todo={todo} />);
      const row = screen.getByRole('listitem');
      seen.push({
        times: createdTimes(row),
        firstCheckboxIsCompletion: controlsOf(row, todo.title).firstCheckboxIsCompletion,
      });
    }

    expect(seen).toEqual([
      { times: [createdOf('2026-11-01')], firstCheckboxIsCompletion: true },
      { times: [createdOf('2026-11-01')], firstCheckboxIsCompletion: true },
      { times: [createdOf('2026-11-01')], firstCheckboxIsCompletion: true },
      { times: [createdOf('2026-12-31')], firstCheckboxIsCompletion: true },
    ]);
  });
});
