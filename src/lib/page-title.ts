// §26 the browser tab title shows the remaining count: pure, no Prisma, no server-only.

// §26: the word of the page heading (§7); the count is the only part that varies.
const TITLE_WORD = 'Todos';

// REQ-26.1, REQ-26.2: a zero count shows no "(0)".
export function pageTitle(remaining: number): string {
  return remaining >= 1 ? `(${String(remaining)}) ${TITLE_WORD}` : TITLE_WORD;
}
