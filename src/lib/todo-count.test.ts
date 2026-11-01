import { describe, expect, it } from 'vitest';
import { allDoneMessage, countRemaining, remainingLabel } from './todo-count';

interface CountedTodo {
  readonly title: string;
  readonly completed: boolean;
}

function open(title: string): CountedTodo {
  return Object.freeze({ title, completed: false });
}

function done(title: string): CountedTodo {
  return Object.freeze({ title, completed: true });
}

// Frozen so an in-place change throws (ES modules run in strict mode); the copy proves nothing was reordered.
function frozenList(...todos: CountedTodo[]): readonly CountedTodo[] {
  return Object.freeze([...todos]);
}

function copyOf(todos: readonly CountedTodo[]): CountedTodo[] {
  return todos.map((todo) => ({ ...todo }));
}

describe('countRemaining (§13)', () => {
  it('AC-13.1: returns 0 for an empty list and leaves the input unchanged', () => {
    const todos = frozenList();
    const before = copyOf(todos);

    const remaining = countRemaining(todos);

    expect(remaining).toBe(0);
    expect(todos).toEqual(before);
  });

  it('AC-13.1: returns 3 for three open todos and leaves the input unchanged', () => {
    const todos = frozenList(open('C'), open('B'), open('A'));
    const before = copyOf(todos);

    const remaining = countRemaining(todos);

    expect(remaining).toBe(3);
    expect(todos).toEqual(before);
  });

  it('AC-13.1: returns 3 for open, done, open, done, open and leaves the input unchanged', () => {
    const todos = frozenList(open('E'), done('D'), open('C'), done('B'), open('A'));
    const before = copyOf(todos);

    const remaining = countRemaining(todos);

    expect(remaining).toBe(3);
    expect(todos).toEqual(before);
  });

  it('AC-13.1: returns 0 for two done todos and leaves the input unchanged', () => {
    const todos = frozenList(done('B'), done('A'));
    const before = copyOf(todos);

    const remaining = countRemaining(todos);

    expect(remaining).toBe(0);
    expect(todos).toEqual(before);
  });
});

describe('remainingLabel (§13)', () => {
  it('AC-13.2: returns "0 items left" for 0', () => {
    const count = 0;

    const label = remainingLabel(count);

    expect(label).toBe('0 items left');
  });

  it('AC-13.2: returns "1 item left" for 1', () => {
    const count = 1;

    const label = remainingLabel(count);

    expect(label).toBe('1 item left');
  });

  it('AC-13.2: returns "2 items left" for 2', () => {
    const count = 2;

    const label = remainingLabel(count);

    expect(label).toBe('2 items left');
  });

  it('AC-13.2: returns "11 items left" for 11', () => {
    const count = 11;

    const label = remainingLabel(count);

    expect(label).toBe('11 items left');
  });
});

describe('allDoneMessage (§22)', () => {
  it('AC-22.1: returns "All done" for 0 and undefined for 1, 2 and 11', () => {
    const counts = [0, 1, 2, 11];

    const messages = counts.map((count) => allDoneMessage(count));

    expect(messages).toEqual(['All done', undefined, undefined, undefined]);
  });
});
