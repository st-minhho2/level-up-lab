'use client';

// §16 TodoSearchForm, extended by §21 (a "Clear search" link) and §25 (the `/` key focuses the box): a native GET
// form; 'use client' only for §25's ref and document keydown effect.
import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { CLEAR_SEARCH_LABEL, clearSearchHref, isSearchInEffect } from '@/lib/clear-search';
import { isSearchShortcut } from '@/lib/search-shortcut';
import type { TodoFilter } from '@/lib/todo-filter';
import { SEARCH_QUERY_MAX_LENGTH } from '@/lib/todo-search';

// REQ-16.1, REQ-16.2, REQ-16.6: submitting sends `q` to `/` and keeps a selected filter; All is the bare address.
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode {
  const searchBoxRef = useRef<HTMLInputElement>(null);

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
        className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
      <button type="submit" className="rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700">
        Search
      </button>
      {/* REQ-21.1, REQ-21.2, REQ-21.5: an anchor (GET, works without JavaScript) only while a search is in effect. */}
      {isSearchInEffect(query) && (
        <Link
          href={clearSearchHref(filter)}
          className="self-center text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          {CLEAR_SEARCH_LABEL}
        </Link>
      )}
    </form>
  );
}
