import { describe, expect, it } from 'vitest';
import { DUE_TODAY_LABEL, isDueToday } from './todo-due-today';

describe('isDueToday (§31)', () => {
  it("AC-31.1: returns true, false, false, false, false, true for the six cases, and DUE_TODAY_LABEL is exactly 'Due today'", () => {
    const cases: readonly (readonly [string | undefined, string, boolean])[] = [
      ['2026-11-01', '2026-11-01', false],
      ['2026-10-31', '2026-11-01', false],
      ['2026-11-02', '2026-11-01', false],
      [undefined, '2026-11-01', false],
      ['2026-11-01', '2026-11-01', true],
      ['0999-12-31', '0999-12-31', false],
    ];

    const results = cases.map(([dueDate, today, completed]) => isDueToday(dueDate, today, completed));

    expect(results).toEqual([true, false, false, false, false, true]);
    expect(DUE_TODAY_LABEL).toBe('Due today');
  });
});
