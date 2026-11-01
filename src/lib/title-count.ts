// §18 the new-todo title counter (B3.2): pure, no Prisma, no server-only, so the client form may import it.
import { TITLE_MAX_LENGTH } from '@/lib/todo-schema';

// The §5 schema trims and counts UTF-16 code units, so the counter reports the judgement the save will make.
export function titleCharacterCount(value: string): number {
  return value.trim().length;
}

export function titleCounterText(value: string): string {
  return `${String(titleCharacterCount(value))} / ${String(TITLE_MAX_LENGTH)}`;
}
