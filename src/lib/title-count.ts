// §18 the new-todo title counter (B3.2), §39 its near-limit warning (B7.5): pure, no Prisma, no server-only, so the
// client form may import it.
import { NotImplementedError } from '@/lib/errors';
import { TITLE_MAX_LENGTH } from '@/lib/todo-schema';

// §39: the warning shows from this many counted characters, below TITLE_MAX_LENGTH (§5).
export const TITLE_WARNING_THRESHOLD = 180;

// The §5 schema trims and counts UTF-16 code units, so the counter reports the judgement the save will make.
export function titleCharacterCount(value: string): number {
  return value.trim().length;
}

export function titleCounterText(value: string): string {
  return `${String(titleCharacterCount(value))} / ${String(TITLE_MAX_LENGTH)}`;
}

export function isTitleNearLimit(value: string): boolean {
  void value;
  throw new NotImplementedError('isTitleNearLimit');
}
