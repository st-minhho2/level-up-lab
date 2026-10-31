import { describe, expect, it } from 'vitest';
import { emptyListMessage, filterTodos, parseTodoFilter } from './todo-filter';

interface FakeTodo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
}

function todo(title: string, completed: boolean): FakeTodo {
  return { id: crypto.randomUUID(), title, completed };
}

function titlesOf(todos: readonly FakeTodo[]): string[] {
  return todos.map((item) => item.title);
}

describe('filterTodos (§12)', () => {
  it('AC-12.1: keeps the todos that match the filter, in input order, and never mutates the input', () => {
    const d = todo('D', false);
    const c = todo('C', true);
    const b = todo('B', false);
    const a = todo('A', true);
    const todos: readonly FakeTodo[] = [d, c, b, a];

    const active = filterTodos(todos, 'active');
    const completed = filterTodos(todos, 'completed');
    const all = filterTodos(todos, 'all');

    expect(active.map((item) => item.id)).toEqual([d.id, b.id]);
    expect(completed.map((item) => item.id)).toEqual([c.id, a.id]);
    expect(all.map((item) => item.id)).toEqual([d.id, c.id, b.id, a.id]);
    expect(titlesOf(todos)).toEqual(['D', 'C', 'B', 'A']);
    expect(todos.map((item) => item.completed)).toEqual([false, true, false, true]);
    expect(all).not.toBe(todos);
    expect(active).not.toBe(todos);
    expect(completed).not.toBe(todos);
  });
});

describe('parseTodoFilter (§12)', () => {
  it("AC-12.2: 'active' and 'completed' select themselves; undefined, 'all', '', 'Active', 'bogus' and a repeated parameter select 'all' without throwing", () => {
    const inputs: readonly (string | string[] | undefined)[] = [
      'active',
      'completed',
      undefined,
      'all',
      '',
      'Active',
      'bogus',
      ['active', 'completed'],
    ];

    const results = inputs.map((value) => parseTodoFilter(value));

    expect(results).toEqual(['active', 'completed', 'all', 'all', 'all', 'all', 'all', 'all']);
  });
});

describe('emptyListMessage (§12)', () => {
  it("AC-12.3: 'No todos yet' when no todo is stored or under All, 'No active todos' under Active and 'No completed todos' under Completed otherwise", () => {
    const pairs: readonly (readonly [Parameters<typeof emptyListMessage>[0], number])[] = [
      ['all', 0],
      ['active', 0],
      ['completed', 0],
      ['active', 3],
      ['completed', 3],
      ['all', 3],
    ];

    const messages = pairs.map(([filter, totalCount]) => emptyListMessage(filter, totalCount));

    expect(messages).toEqual([
      'No todos yet',
      'No todos yet',
      'No todos yet',
      'No active todos',
      'No completed todos',
      'No todos yet',
    ]);
  });
});
