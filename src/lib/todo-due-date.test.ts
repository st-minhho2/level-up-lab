import { describe, expect, it } from 'vitest';
import { fieldErrorsOf } from './action-result';
import { dueDateOf, dueDateToDate, setTodoDueDateSchema } from './todo-due-date';

// The parsed data on success, or the `fieldErrorsOf` result on failure: both sides are compared exactly.
function parse(input: { id?: string; dueDate?: string }): { data?: unknown; fieldErrors?: Record<string, string[]> } {
  const result = setTodoDueDateSchema.safeParse(input);
  return result.success ? { data: result.data } : { fieldErrors: fieldErrorsOf(result.error) };
}

function invalidDueDate(): { fieldErrors: Record<string, string[]> } {
  return { fieldErrors: { dueDate: ['Due date must be a valid date'] } };
}

describe('setTodoDueDateSchema (§15)', () => {
  it('AC-15.1: accepts 2026-11-05, 2024-02-29 and an empty value, with data exactly the id and the day or undefined', () => {
    const values = ['2026-11-05', '2024-02-29', ''];

    const results = values.map((dueDate) => parse({ id: 'todo-1', dueDate }));

    expect(results).toEqual([
      { data: { id: 'todo-1', dueDate: '2026-11-05' } },
      { data: { id: 'todo-1', dueDate: '2024-02-29' } },
      { data: { id: 'todo-1', dueDate: undefined } },
    ]);
    expect((results[2]?.data as { dueDate?: unknown } | undefined)?.dueDate).toBeUndefined();
  });

  it('AC-15.1: rejects each of the eight invalid values with exactly { dueDate: ["Due date must be a valid date"] }', () => {
    const values = [
      '2026-02-29',
      '2026-02-30',
      '2026-13-01',
      '0000-01-01',
      '5/11/2026',
      '2026-1-5',
      ' 2026-11-05',
      'soon',
    ];

    const results = values.map((dueDate) => parse({ id: 'todo-1', dueDate }));

    expect(results).toEqual(values.map(() => invalidDueDate()));
  });

  it('AC-15.1: an empty id fails with exactly { id: ["Todo id is required"] } when the date is valid', () => {
    const result = parse({ id: '', dueDate: '2026-11-05' });

    expect(result).toEqual({ fieldErrors: { id: ['Todo id is required'] } });
  });

  it('AC-15.1: accepts the year bounds 0001-01-01 and 9999-12-31 as written', () => {
    const values = ['0001-01-01', '9999-12-31'];

    const results = values.map((dueDate) => parse({ id: 'todo-1', dueDate }));

    expect(results).toEqual([
      { data: { id: 'todo-1', dueDate: '0001-01-01' } },
      { data: { id: 'todo-1', dueDate: '9999-12-31' } },
    ]);
  });

  it('AC-15.1: rejects trailing text (2026-11-05 with a trailing space, 2026-11-055) and 1900-02-29 with exactly the dueDate message', () => {
    const values = ['2026-11-05 ', '2026-11-055', '1900-02-29'];

    const results = values.map((dueDate) => parse({ id: 'todo-1', dueDate }));

    expect(results).toEqual([invalidDueDate(), invalidDueDate(), invalidDueDate()]);
  });

  it('AC-15.1: rejects a missing dueDate with exactly { dueDate: ["Due date must be a valid date"] }', () => {
    const result = parse({ id: 'todo-1' });

    expect(result).toEqual(invalidDueDate());
  });
});

describe('dueDateToDate and dueDateOf (§15)', () => {
  it('AC-15.2: converts 2026-11-05 to UTC midnight and back, and a stored null to undefined', () => {
    const stored = new Date('2026-11-05T00:00:00.000Z');

    const converted = dueDateToDate('2026-11-05');
    const read = dueDateOf(stored);
    const none = dueDateOf(null);

    expect(converted.toISOString()).toBe('2026-11-05T00:00:00.000Z');
    expect(converted).toEqual(stored);
    expect(read).toBe('2026-11-05');
    expect(none).toBeUndefined();
  });
});
