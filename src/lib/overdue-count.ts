// §23 overdue count: how many stored todos are overdue by §17's rule, and the text shown for that number.
// Pure: no Prisma, no server-only, so a client component may import it.
import { isOverdue } from '@/lib/todo-overdue';

export function countOverdue(
  todos: readonly { readonly completed: boolean; readonly dueDate?: string }[],
  today: string,
): number {
  return todos.filter((todo) => isOverdue(todo.dueDate, today, todo.completed)).length;
}

export function overdueLabel(count: number): string | undefined {
  return count === 0 ? undefined : `${count} overdue`;
}
