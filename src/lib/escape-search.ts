// §27 Escape clears the search box: decides whether a keydown in the box is the clearing Escape.
// Pure: no Prisma, no server-only, no DOM access, so the §16 search form (a client component) may import it.
import { NotImplementedError } from '@/lib/errors';

// REQ-27.1: the clearing key, compared with KeyboardEvent.key.
export const SEARCH_ESCAPE_KEY: string = 'Escape';

export interface EscapeEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
}

export function isSearchEscape(event: EscapeEvent): boolean {
  void event;
  throw new NotImplementedError('isSearchEscape');
}
