// §32 clear-completed label: the §9 button's text with the count of stored completed todos.
// Pure: no Prisma, no server-only, so a client component may import it.

const CLEAR_COMPLETED_TEXT = 'Clear completed';

// REQ-32.1 / REQ-32.2: the count only when at least one todo would be cleared, never padded.
export function clearCompletedLabel(completed: number): string {
  return completed >= 1 ? `${CLEAR_COMPLETED_TEXT} (${String(completed)})` : CLEAR_COMPLETED_TEXT;
}
