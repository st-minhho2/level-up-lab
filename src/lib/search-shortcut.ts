// §25 the slash key focuses the search box: decides whether a keydown is the shortcut.
// Pure: no Prisma, no server-only, no DOM access, so the §16 search form (a client component) may import it.
import { NotImplementedError } from '@/lib/errors';

// REQ-25.1: the shortcut key, compared with KeyboardEvent.key.
export const SEARCH_SHORTCUT_KEY: string = '/';

export interface ShortcutEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly target: { readonly tagName?: string; readonly type?: string; readonly isContentEditable?: boolean } | null;
}

export function isSearchShortcut(event: ShortcutEvent): boolean {
  void event;
  throw new NotImplementedError('isSearchShortcut');
}
