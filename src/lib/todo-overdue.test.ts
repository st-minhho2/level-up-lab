import { afterEach, describe, expect, it, vi } from 'vitest';
import { isOverdue, OVERDUE_LABEL, todayOf } from './todo-overdue';

// Zones on both sides of UTC: at local midnight a UTC reading lands on the other calendar day in each of them.
const ZONES = ['Pacific/Kiritimati', 'Pacific/Pago_Pago', 'UTC'] as const;

// The five `Date`s of AC-17.1, built from local fields after the zone is set, so each is the same local moment in
// every zone.
function localDates(): Date[] {
  const yearFive = new Date(2026, 0, 1, 12);
  yearFive.setFullYear(5, 0, 1);
  return [
    new Date(2026, 10, 1, 23, 59, 59, 999),
    new Date(2026, 10, 2, 0, 0, 0, 0),
    new Date(2026, 0, 5, 12),
    new Date(2026, 11, 31, 12),
    yearFive,
  ];
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('todayOf (§17)', () => {
  it("AC-17.1: returns exactly '2026-11-01', '2026-11-02', '2026-01-05', '2026-12-31' and '0005-01-01' from local fields under any TZ", () => {
    const results: Record<string, string[]> = {};

    for (const zone of ZONES) {
      vi.stubEnv('TZ', zone);
      results[zone] = localDates().map((now) => todayOf(now));
    }

    const expected = ['2026-11-01', '2026-11-02', '2026-01-05', '2026-12-31', '0005-01-01'];
    expect(results).toEqual({
      'Pacific/Kiritimati': expected,
      'Pacific/Pago_Pago': expected,
      UTC: expected,
    });
  });
});

describe('isOverdue (§17)', () => {
  it("AC-17.2: returns true, false, false, false, false, true, true, false for the eight cases, and OVERDUE_LABEL is exactly 'Overdue'", () => {
    const cases: readonly (readonly [string | undefined, string, boolean])[] = [
      ['2026-10-31', '2026-11-01', false],
      ['2026-11-01', '2026-11-01', false],
      ['2026-11-02', '2026-11-01', false],
      [undefined, '2026-11-01', false],
      ['2026-10-31', '2026-11-01', true],
      ['2025-12-31', '2026-01-01', false],
      ['0999-12-31', '1000-01-01', false],
      ['2026-11-01', '2026-10-31', false],
    ];

    const results = cases.map(([dueDate, today, completed]) => isOverdue(dueDate, today, completed));

    expect(results).toEqual([true, false, false, false, false, true, true, false]);
    expect(OVERDUE_LABEL).toBe('Overdue');
  });
});
