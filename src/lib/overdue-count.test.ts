import { describe, expect, it } from 'vitest';
import { countOverdue, overdueLabel } from './overdue-count';

interface Entry {
  readonly completed: boolean;
  readonly dueDate?: string;
}

function open(dueDate?: string): Entry {
  return dueDate === undefined ? { completed: false } : { completed: false, dueDate };
}

function done(dueDate: string): Entry {
  return { completed: true, dueDate };
}

// The six todos of AC-23.1, in its order.
function sixTodos(): Entry[] {
  return [open('2026-10-31'), open('2026-11-01'), open('2026-11-02'), open(), done('2026-10-31'), open('2026-01-01')];
}

describe('countOverdue (§23)', () => {
  it('AC-23.1: returns 2 for the list and 0 for [], and the input list has the same 6 entries in the same order after the call', () => {
    const todos = sixTodos();
    const before = structuredClone(todos);

    const forList = countOverdue(todos, '2026-11-01');
    const forEmpty = countOverdue([], '2026-11-01');

    expect(forList).toBe(2);
    expect(forEmpty).toBe(0);
    expect(todos).toHaveLength(6);
    expect(todos).toEqual(before);
  });
});

describe('overdueLabel (§23)', () => {
  it('AC-23.2: returns undefined, "1 overdue", "2 overdue", "11 overdue" for 0, 1, 2, 11', () => {
    const counts = [0, 1, 2, 11];

    const labels = counts.map((count) => overdueLabel(count));

    expect(labels).toEqual([undefined, '1 overdue', '2 overdue', '11 overdue']);
  });
});
