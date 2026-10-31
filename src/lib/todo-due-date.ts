// §15 due date: the input rule and the conversions between the 'YYYY-MM-DD' day and the stored DATE column.
// Pure: no Prisma, no server-only, so a client component may import it.
import { z } from 'zod';
import { NotImplementedError } from '@/lib/errors';

export const DUE_DATE_INVALID_MESSAGE = 'Due date must be a valid date';

// Skeleton (B2.4): rejects every value so no accept-only test is green before the green step.
export const setTodoDueDateSchema = z.object({
  id: z.string().min(1, 'Todo id is required'),
  dueDate: z
    .string()
    .refine(() => false, 'not implemented (B2.4)')
    .transform((value): string | undefined => value),
});

export type SetTodoDueDateInput = z.infer<typeof setTodoDueDateSchema>;

export function dueDateToDate(dueDate: string): Date {
  throw new NotImplementedError(`dueDateToDate(${dueDate})`);
}

export function dueDateOf(stored: Date | null): string | undefined {
  throw new NotImplementedError(`dueDateOf(${String(stored)})`);
}
