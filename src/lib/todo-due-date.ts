// §15 due date: the input rule and the conversions between the 'YYYY-MM-DD' day and the stored DATE column.
// Pure: no Prisma, no server-only, so a client component may import it.
import { z } from 'zod';

export const DUE_DATE_INVALID_MESSAGE = 'Due date must be a valid date';

const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// The day as UTC midnight, so no time zone shifts it (REQ-15.1).
export function dueDateToDate(dueDate: string): Date {
  return new Date(`${dueDate}T00:00:00.000Z`);
}

export function dueDateOf(stored: Date | null): string | undefined {
  // Optional chaining also covers a row with no dueDate key at all (the §5/§6 lib tests' mocked rows).
  return stored?.toISOString().slice(0, 10);
}

// REQ-15.7: the format first, then a round trip through Date, which rolls an impossible day (2026-02-30) into
// another one; year 0000 parses but is outside 0001-9999.
function isCalendarDay(value: string): boolean {
  if (!DUE_DATE_PATTERN.test(value) || value.startsWith('0000')) {
    return false;
  }
  const date = dueDateToDate(value);
  return !Number.isNaN(date.getTime()) && dueDateOf(date) === value;
}

export const setTodoDueDateSchema = z.object({
  id: z.string().min(1, 'Todo id is required'),
  // No trimming (AC-15.1 rejects ' 2026-11-05'); '' clears the due date (REQ-15.3).
  dueDate: z
    .string({ error: DUE_DATE_INVALID_MESSAGE })
    .refine((value) => value === '' || isCalendarDay(value), DUE_DATE_INVALID_MESSAGE)
    .transform((value): string | undefined => (value === '' ? undefined : value)),
});

export type SetTodoDueDateInput = z.infer<typeof setTodoDueDateSchema>;
