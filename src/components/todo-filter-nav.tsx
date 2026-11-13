// §12 TodoFilterNav: links only, no state or events, so no 'use client'.
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import type { FilterCounts } from '@/lib/filter-counts';
import type { TodoFilter } from '@/lib/todo-filter';

interface FilterLink {
  readonly filter: TodoFilter;
  readonly label: string;
  readonly href: string;
}

// REQ-12.1, REQ-12.6: this order and these addresses; All is the bare `/`.
const FILTER_LINKS: readonly FilterLink[] = [
  { filter: 'all', label: 'All', href: '/' },
  { filter: 'active', label: 'Active', href: '/?filter=active' },
  { filter: 'completed', label: 'Completed', href: '/?filter=completed' },
];

// No <ul>: the links must never count as list items (REQ-12.1), the rows of the todo list are the only ones.
// §30 REQ-30.2: each count is a <span> after its link, never inside it, so the link's name stays "All" etc.;
// REQ-30.6: without `counts` no span is rendered.
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode {
  return (
    <nav aria-label="Filter todos" className="flex gap-3 text-sm">
      {FILTER_LINKS.map((link) => (
        <Fragment key={link.filter}>
          <Link
            href={link.href}
            aria-current={link.filter === selected ? 'page' : undefined}
            className="text-zinc-600 underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-zinc-900 dark:text-zinc-400 dark:aria-[current=page]:text-zinc-100"
          >
            {link.label}
          </Link>
          {counts === undefined ? undefined : (
            <span className="text-zinc-500 dark:text-zinc-400">{`(${counts[link.filter]})`}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
