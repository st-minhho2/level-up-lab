// §36 complete-all label: the §14 button's text with the count of stored open todos.
// Pure: no Prisma, no server-only, so a client component may import it.

const COMPLETE_ALL_TEXT = 'Mark all complete';

// REQ-36.1 / REQ-36.2: the count only when at least one todo would be marked, never padded.
export function completeAllLabel(open: number): string {
  return open >= 1 ? `${COMPLETE_ALL_TEXT} (${String(open)})` : COMPLETE_ALL_TEXT;
}
