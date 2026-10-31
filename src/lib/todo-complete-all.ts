// §14 mark all complete (B2.3): one updateMany through '@/lib/prisma'.
import { prisma } from '@/lib/prisma';

// One statement scoped to open rows (REQ-14.1); completed rows, titles and order are untouched (REQ-14.2); resolves
// the changed count, 0 when none is open (REQ-14.3, REQ-14.7).
export async function completeAllTodos(): Promise<number> {
  const { count } = await prisma.todo.updateMany({ where: { completed: false }, data: { completed: true } });
  return count;
}
