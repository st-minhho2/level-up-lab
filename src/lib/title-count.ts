// §18 the new-todo title counter (B3.2): pure, no Prisma, no server-only, so the client form may import it.
// Skeleton: the bodies are written by the green commit.
import { NotImplementedError } from '@/lib/errors';
import { TITLE_MAX_LENGTH } from '@/lib/todo-schema';

export function titleCharacterCount(value: string): number {
  throw new NotImplementedError(`titleCharacterCount(${value})`);
}

export function titleCounterText(value: string): string {
  throw new NotImplementedError(`titleCounterText(${value}, ${String(TITLE_MAX_LENGTH)})`);
}
