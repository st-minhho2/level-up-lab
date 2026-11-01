// §17 overdue: "today" as the browser's local calendar day and the overdue rule on two 'YYYY-MM-DD' strings.
// Pure: no Prisma, no server-only, so a client component may import it.

export const OVERDUE_LABEL = 'Overdue';

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0');
}

// Local fields only (REQ-17.1): a UTC reading would land on the neighbouring day near midnight.
export function todayOf(now: Date): string {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1, 2)}-${pad(now.getDate(), 2)}`;
}

// Fixed-width 'YYYY-MM-DD' strings order as calendar days, so a string comparison is the date comparison.
export function isOverdue(dueDate: string | undefined, today: string, completed: boolean): boolean {
  return !completed && dueDate !== undefined && dueDate < today;
}
