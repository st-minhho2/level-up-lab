// §19 delete a todo (B3.3): one deleteMany through '@/lib/prisma'.
import { prisma } from '@/lib/prisma';
import { TodoNotFoundError } from '@/lib/todos';

// deleteMany, not delete: a missing id resolves count 0 instead of throwing a Prisma error, so "never existed" and
// "already deleted" are one case (REQ-19.8) without a second query; the where clause names exactly one id (REQ-19.1).
export async function deleteTodo(id: string): Promise<void> {
  const { count } = await prisma.todo.deleteMany({ where: { id } });
  if (count === 0) {
    throw new TodoNotFoundError(id);
  }
}
