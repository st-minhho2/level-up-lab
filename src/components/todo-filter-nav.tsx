// §12, §30, §42 TodoFilterNav: links only, no state or events, so no 'use client'.
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
// §42 REQ-42.1, REQ-42.2: with `counts`, a link at 0 is left out of the document unless it is the current filter,
// so the page still says where the person is; without `counts` all three stay (REQ-42.6).
export function TodoFilterNav({
  selected,
  counts,
}: {
  readonly selected: TodoFilter;
  readonly counts?: FilterCounts;
}): ReactNode {
  const shownLinks =
    counts === undefined
      ? FILTER_LINKS
      : FILTER_LINKS.filter((link) => counts[link.filter] !== 0 || link.filter === selected);
  return (
    <nav aria-label="Filter todos" className="flex gap-3 text-sm">
      {shownLinks.map((link) => (
        <Fragment key={link.filter}>
          <Link
            href={link.href}
            aria-current={link.filter === selected ? 'page' : undefined}
            className="text-zinc-600 underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-zinc-900 dark:text-zinc-400 dark:aria-[current=page]:text-zinc-100"
          >
            {link.label}
          </Link>
          {counts === undefined ? undefined : <span>{`(${counts[link.filter]})`}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
