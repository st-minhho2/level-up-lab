import { describe, expect, it } from 'vitest';
import { filterCounts } from './filter-counts';

interface CountableTodo {
  readonly title: string;
  readonly completed: boolean;
}

function todo(title: string, completed: boolean): CountableTodo {
  return { title, completed };
}

describe('filterCounts (§30)', () => {
  it('AC-30.1: counts 4 all, 2 active, 2 completed for D, C, B, A, zeros for [] and leaves the input unchanged', () => {
    const todos = [todo('D', false), todo('C', true), todo('B', false), todo('A', true)];
    const snapshot = todos.map((item) => ({ ...item }));

    const fourCounts = filterCounts(todos);
    const emptyCounts = filterCounts([]);
    const oneOpenCounts = filterCounts([todo('E', false)]);

    expect(fourCounts).toEqual({ all: 4, active: 2, completed: 2 });
    expect(emptyCounts).toEqual({ all: 0, active: 0, completed: 0 });
    expect(oneOpenCounts).toEqual({ all: 1, active: 1, completed: 0 });
    expect(todos.map((item) => item.title)).toEqual(['D', 'C', 'B', 'A']);
    expect(todos).toEqual(snapshot);
  });
});
