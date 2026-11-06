// §27 Escape clears the search box: decides whether a keydown in the box is the clearing Escape.
// Pure: no Prisma, no server-only, no DOM access, so the §16 search form (a client component) may import it.

// REQ-27.1: the clearing key, compared with KeyboardEvent.key.
export const SEARCH_ESCAPE_KEY: string = 'Escape';

export interface EscapeEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
}

// REQ-27.1, REQ-27.5: Escape alone clears; any modifier leaves the key to the browser and §16, §25.
export function isSearchEscape(event: EscapeEvent): boolean {
  return event.key === SEARCH_ESCAPE_KEY && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey;
}
