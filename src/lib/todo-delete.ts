// §19 delete a todo (B3.3): one deleteMany through '@/lib/prisma'. Skeleton: the body is written by the green commit.
import { NotImplementedError } from '@/lib/errors';

export async function deleteTodo(id: string): Promise<void> {
  return Promise.reject(new NotImplementedError(`deleteTodo(${id})`));
}
