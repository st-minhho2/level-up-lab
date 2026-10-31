// §5 list/create/toggle, §6 edit title, §9 clear completed, §15 due date.
import { prisma } from '@/lib/prisma';
import { dueDateOf, dueDateToDate } from '@/lib/todo-due-date';

export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  // §15: 'YYYY-MM-DD'; absent when the todo has none.
  readonly dueDate?: string;
}

export class TodoNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Todo not found: ${id}`);
    this.name = 'TodoNotFoundError';
  }
}

const todoFields = { id: true, title: true, completed: true, createdAt: true, dueDate: true } as const;

interface TodoRow {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Date;
  readonly dueDate: Date | null;
}

// §15: the DATE column becomes 'YYYY-MM-DD'; a todo without one has dueDate undefined (REQ-15.1).
function toTodo(row: TodoRow): Todo {
  return { ...row, dueDate: dueDateOf(row.dueDate) };
}

export async function listTodos(): Promise<Todo[]> {
  const rows = await prisma.todo.findMany({ select: todoFields, orderBy: { createdAt: 'desc' } });
  return rows.map(toTodo);
}

export async function createTodo(title: string): Promise<Todo> {
  return toTodo(await prisma.todo.create({ data: { title }, select: todoFields }));
}

export async function toggleTodo(id: string): Promise<Todo> {
  const current = await prisma.todo.findUnique({ where: { id }, select: { completed: true } });
  if (current === null) {
    throw new TodoNotFoundError(id);
  }
  return toTodo(
    await prisma.todo.update({ where: { id }, data: { completed: !current.completed }, select: todoFields }),
  );
}

// §6: `data` holds only the title so completion state and createdAt (the list order) cannot change (REQ-6.3, REQ-6.4).
export async function updateTodoTitle(id: string, title: string): Promise<Todo> {
  const current = await prisma.todo.findUnique({ where: { id }, select: { id: true } });
  if (current === null) {
    throw new TodoNotFoundError(id);
  }
  return toTodo(await prisma.todo.update({ where: { id }, data: { title }, select: todoFields }));
}

// §15: sets (a 'YYYY-MM-DD' day) or clears (undefined) the due date only; `data` holds nothing else so title,
// completion and createdAt (the list order) cannot change (REQ-15.4).
export async function setTodoDueDate(id: string, dueDate: string | undefined): Promise<Todo> {
  const current = await prisma.todo.findUnique({ where: { id }, select: { id: true } });
  if (current === null) {
    throw new TodoNotFoundError(id);
  }
  const stored = dueDate === undefined ? null : dueDateToDate(dueDate);
  return toTodo(await prisma.todo.update({ where: { id }, data: { dueDate: stored }, select: todoFields }));
}

// §9: one statement scoped to completed rows (REQ-9.1); open rows are untouched (REQ-9.2); 0 when none (REQ-9.7).
export async function clearCompletedTodos(): Promise<number> {
  const { count } = await prisma.todo.deleteMany({ where: { completed: true } });
  return count;
}
