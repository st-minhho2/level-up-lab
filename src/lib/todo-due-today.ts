// §31 due today: the "Due today" marker's text and the rule on two 'YYYY-MM-DD' strings (today from §17's todayOf).
// Pure: no Prisma, no server-only, so a client component may import it.

export const DUE_TODAY_LABEL = 'Due today';

export function isDueToday(dueDate: string | undefined, today: string, completed: boolean): boolean {
  return !completed && dueDate !== undefined && dueDate === today;
}
