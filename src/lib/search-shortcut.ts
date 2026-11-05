// §25 the slash key focuses the search box: decides whether a keydown is the shortcut.
// Pure: no Prisma, no server-only, no DOM access, so the §16 search form (a client component) may import it.

// REQ-25.1: the shortcut key, compared with KeyboardEvent.key.
export const SEARCH_SHORTCUT_KEY: string = '/';

export interface ShortcutEvent {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
  readonly target: { readonly tagName?: string; readonly type?: string; readonly isContentEditable?: boolean } | null;
}

// REQ-25.3 (D-31): input types that take no typed text, so `/` from them still moves focus.
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'checkbox',
  'radio',
  'button',
  'submit',
  'reset',
  'image',
  'file',
  'range',
  'color',
]);

// REQ-25.3: the one definition of a text-entry element.
function isTextEntry(target: NonNullable<ShortcutEvent['target']>): boolean {
  if (target.isContentEditable === true) {
    return true;
  }
  const tagName = (target.tagName ?? '').toUpperCase();
  if (tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }
  if (tagName === 'INPUT') {
    return target.type === undefined || !NON_TEXT_INPUT_TYPES.has(target.type.toLowerCase());
  }
  return false;
}

// REQ-25.1, REQ-25.3, REQ-25.4: `/` with no Ctrl, Meta or Alt, outside a text-entry element.
export function isSearchShortcut(event: ShortcutEvent): boolean {
  if (event.key !== SEARCH_SHORTCUT_KEY || event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }
  return event.target === null || !isTextEntry(event.target);
}
