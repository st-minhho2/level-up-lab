// §12 TodoFilterNav: links only, no state or events, so no 'use client'.
import Link from 'next/link';
import type { ReactNode } from 'react';
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
export function TodoFilterNav({ selected }: { readonly selected: TodoFilter }): ReactNode {
  return (
    <nav aria-label="Filter todos" className="flex gap-3 text-sm">
      {FILTER_LINKS.map((link) => (
        <Link
          key={link.filter}
          href={link.href}
          aria-current={link.filter === selected ? 'page' : undefined}
          className="text-zinc-600 underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-zinc-900 dark:text-zinc-400 dark:aria-[current=page]:text-zinc-100"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
