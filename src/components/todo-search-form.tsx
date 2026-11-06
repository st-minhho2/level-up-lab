'use client';

// §16 TodoSearchForm, extended by §21 (a "Clear search" link), §25 (the `/` key focuses the box) and §27 (Escape in
// the box clears it): a native GET form; 'use client' only for the refs and keydown handlers of §25 and §27.
import Link from 'next/link';
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { CLEAR_SEARCH_LABEL, clearSearchHref, isSearchInEffect } from '@/lib/clear-search';
import { isSearchEscape } from '@/lib/escape-search';
import { isSearchShortcut } from '@/lib/search-shortcut';
import type { TodoFilter } from '@/lib/todo-filter';
import { SEARCH_QUERY_MAX_LENGTH } from '@/lib/todo-search';

// REQ-16.1, REQ-16.2, REQ-16.6: submitting sends `q` to `/` and keeps a selected filter; All is the bare address.
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode {
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const clearLinkRef = useRef<HTMLAnchorElement>(null);

  // REQ-27.1 to REQ-27.3: Escape empties the box; with a search in effect the "Clear search" link is activated, so
  // §21's clearSearchHref stays the one source of the address. REQ-27.4: no action, nothing stored.
  function onSearchBoxKeyDown(event: ReactKeyboardEvent<HTMLInputElement>): void {
    // The native event: React's synthetic `key` normalizes the legacy 'Esc' to 'Escape', which REQ-27.5 excludes.
    if (!isSearchEscape(event.nativeEvent)) {
      return;
    }
    event.preventDefault();
    event.currentTarget.value = '';
    if (isSearchInEffect(query)) {
      clearLinkRef.current?.click();
    }
  }

  // REQ-25.1, REQ-25.2, REQ-25.6: one document listener while the form is mounted, removed on unmount.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      // An HTMLInputElement is an HTMLElement, so its `type` reaches isSearchShortcut (REQ-25.3).
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (
        isSearchShortcut({
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          altKey: event.altKey,
          target,
        })
      ) {
        event.preventDefault();
        searchBoxRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <form role="search" method="get" action="/" className="flex gap-2">
      <label htmlFor="search-todos" className="sr-only">
        Search todos
      </label>
      {/* REQ-16.2, REQ-16.7: the input remounts on each change of filter or query (a filter link or a search), so
          it then shows the current query, not text typed but not submitted. NUL is in no filter name, so two
          different pairs never share a key. */}
      <input
        key={`${filter}\u0000${query}`}
        ref={searchBoxRef}
        id="search-todos"
        type="search"
        name="q"
        maxLength={SEARCH_QUERY_MAX_LENGTH}
        defaultValue={query}
        onKeyDown={onSearchBoxKeyDown}
        className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
      <button type="submit" className="rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700">
        Search
      </button>
      {/* REQ-21.1, REQ-21.2, REQ-21.5: an anchor (GET, works without JavaScript) only while a search is in effect. */}
      {isSearchInEffect(query) && (
        <Link
          ref={clearLinkRef}
          href={clearSearchHref(filter)}
          className="self-center text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          {CLEAR_SEARCH_LABEL}
        </Link>
      )}
    </form>
  );
}
