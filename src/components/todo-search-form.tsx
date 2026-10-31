// §16 TodoSearchForm: a native GET form, no state or events, so no 'use client'.
import type { ReactNode } from 'react';
import type { TodoFilter } from '@/lib/todo-filter';
import { SEARCH_QUERY_MAX_LENGTH } from '@/lib/todo-search';

// REQ-16.1, REQ-16.2, REQ-16.6: submitting sends `q` to `/` and keeps a selected filter; All is the bare address.
export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode {
  return (
    <form role="search" method="get" action="/" className="flex gap-2">
      <label htmlFor="search-todos" className="sr-only">
        Search todos
      </label>
      {/* REQ-16.2: a new key on each query remounts the input, so a soft navigation shows the current query, not
          text typed but not submitted. */}
      <input
        key={query}
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
    </form>
  );
}
