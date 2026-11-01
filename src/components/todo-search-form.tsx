// §16 TodoSearchForm, extended by §21: a native GET form and a link, no state or events, so no 'use client'.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CLEAR_SEARCH_LABEL, clearSearchHref, isSearchInEffect } from '@/lib/clear-search';
import type { TodoFilter } from '@/lib/todo-filter';
import { SEARCH_QUERY_MAX_LENGTH } from '@/lib/todo-search';

// REQ-16.1, REQ-16.2, REQ-16.6: submitting sends `q` to `/` and keeps a selected filter; All is the bare address.
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode {
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
