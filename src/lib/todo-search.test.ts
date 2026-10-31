import { describe, expect, it } from 'vitest';
import type { TodoFilter } from './todo-filter';
import { parseSearchQuery, searchEmptyMessage, searchTodos } from './todo-search';

// searchTodos is generic over `{ readonly title: string }`: plain literals, not the Todo type (advice, Test strategy).
interface FakeTodo {
  readonly id: string;
  readonly title: string;
}

function todo(title: string): FakeTodo {
  return { id: crypto.randomUUID(), title };
}

function idsOf(todos: readonly FakeTodo[]): string[] {
  return todos.map((item) => item.id);
}

describe('parseSearchQuery (§16)', () => {
  it("AC-16.1: trims a string and keeps inner spaces; undefined, '', whitespace, a repeated parameter and [] give ''; 201 characters come back unchanged; it never throws", () => {
    const long = 'x'.repeat(201);
    const cases: readonly (readonly [string | string[] | undefined, string])[] = [
      ['milk', 'milk'],
      ['  milk  ', 'milk'],
      ['Buy  milk', 'Buy  milk'],
      [undefined, ''],
      ['', ''],
      ['   ', ''],
      [['milk', 'bread'], ''],
      [[], ''],
      [long, long],
    ];

    const throwers = cases.map(
      ([value]) =>
        () =>
          parseSearchQuery(value),
    );
    const results = cases.map(([value]) => parseSearchQuery(value));

    for (const thrower of throwers) {
      expect(thrower).not.toThrow();
    }
    expect(results).toEqual(cases.map(([, expected]) => expected));
    expect(results[8]).toHaveLength(201);
  });
});

describe('searchTodos (§16)', () => {
  it('AC-16.2: keeps the todos whose title contains the trimmed query, ignoring case, in input order, and never mutates the input', () => {
    const d = todo('Buy Milk');
    const c = todo('Call mom');
    const b = todo('milkshake');
    const a = todo('Walk the dog');
    const todos: readonly FakeTodo[] = [d, c, b, a];
    const queries = ['milk', 'MILK', '  milk  ', 'ilks', 'zzz', '', '   ', 'x'.repeat(201)];

    const results = queries.map((query) => searchTodos(todos, query));

    expect(results.map(idsOf)).toEqual([
      [d.id, b.id],
      [d.id, b.id],
      [d.id, b.id],
      [b.id],
      [],
      [d.id, c.id, b.id, a.id],
      [d.id, c.id, b.id, a.id],
      [],
    ]);
    expect(idsOf(todos)).toEqual([d.id, c.id, b.id, a.id]);
    expect(todos.map((item) => item.title)).toEqual(['Buy Milk', 'Call mom', 'milkshake', 'Walk the dog']);
    expect(results[5]).not.toBe(todos);
    expect(results[5]).toEqual([d, c, b, a]);
  });

  it("AC-16.3: compares punctuation as plain text: 'a.b' → [D], '%' → [B], '_' → [E], '.*' and '(' → []", () => {
    const e = todo('a_b');
    const d = todo('a.b');
    const c = todo('axb');
    const b = todo('100%');
    const a = todo('100x');
    const todos: readonly FakeTodo[] = [e, d, c, b, a];
    const queries = ['a.b', '%', '_', '.*', '('];

    const results = queries.map((query) => idsOf(searchTodos(todos, query)));

    expect(results).toEqual([[d.id], [b.id], [e.id], [], []]);
  });

  it("AC-16.3: does not fold accents: 'cafe' matches no todo and 'CAFÉ' matches the \"Café\" todo", () => {
    // Composed code points (U+00E9, U+00C9) so the file's normalization cannot change what is compared.
    const cafe = todo('Café');

    const unaccented = searchTodos([cafe], 'cafe');
    const upperAccented = searchTodos([cafe], 'CAFÉ');

    expect(unaccented).toEqual([]);
    expect(upperAccented).toEqual([cafe]);
  });

  it("AC-16.3: a query longer than 200 code units matches no todo, even a title of 200 'İ' that lowercases longer", () => {
    // Escapes, not literals, so the file's normalization cannot change the code units: U+0130, and U+0069 U+0307.
    const dotted = todo('İ'.repeat(200));
    const query = 'i̇'.repeat(101);

    const result = searchTodos([dotted], query);

    expect(dotted.title).toHaveLength(200);
    expect(query).toHaveLength(202);
    expect(dotted.title.toLowerCase().includes(query)).toBe(true);
    expect(result).toEqual([]);
  });
});

describe('searchEmptyMessage (§16)', () => {
  it("AC-16.4: 'No todos yet' when no todo is stored, 'No todos match your search' when a search is active, otherwise the filter's empty text", () => {
    const cases: readonly (readonly [TodoFilter, number, string, string])[] = [
      ['all', 0, '', 'No todos yet'],
      ['active', 0, 'milk', 'No todos yet'],
      ['completed', 0, 'milk', 'No todos yet'],
      ['all', 3, 'milk', 'No todos match your search'],
      ['active', 3, 'milk', 'No todos match your search'],
      ['completed', 3, 'milk', 'No todos match your search'],
      ['active', 3, '', 'No active todos'],
      ['active', 3, '   ', 'No active todos'],
      ['completed', 3, '', 'No completed todos'],
      ['all', 3, '', 'No todos yet'],
    ];

    const messages = cases.map(([filter, totalCount, query]) => searchEmptyMessage(filter, totalCount, query));

    expect(messages).toEqual(cases.map(([, , , expected]) => expected));
  });
});
