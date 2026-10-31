import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoFilterNav } from './todo-filter-nav';

interface LinkShape {
  readonly name: string;
  readonly href: string | null;
  readonly current: string | null;
}

// The links inside the single "Filter todos" navigation, in document order.
function filterLinks(): LinkShape[] {
  const nav = screen.getByRole('navigation', { name: 'Filter todos' });
  return within(nav)
    .getAllByRole('link')
    .map((link) => ({
      name: link.textContent,
      href: link.getAttribute('href'),
      current: link.getAttribute('aria-current'),
    }));
}

function renderNav(selected: TodoFilter): ReturnType<typeof render> {
  return render(<TodoFilterNav selected={selected} />);
}

describe('<TodoFilterNav> (§12)', () => {
  it('AC-12.4: one "Filter todos" navigation with links All, Active, Completed to /, /?filter=active, /?filter=completed, no list items, and aria-current="page" only on the selected link', () => {
    const view = renderNav('active');

    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    expect(filterLinks()).toEqual([
      { name: 'All', href: '/', current: null },
      { name: 'Active', href: '/?filter=active', current: 'page' },
      { name: 'Completed', href: '/?filter=completed', current: null },
    ]);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Active' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'All' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Completed' })).not.toHaveAttribute('aria-current');

    view.rerender(<TodoFilterNav selected="all" />);

    expect(screen.getAllByRole('navigation')).toHaveLength(1);
    expect(filterLinks()).toEqual([
      { name: 'All', href: '/', current: 'page' },
      { name: 'Active', href: '/?filter=active', current: null },
      { name: 'Completed', href: '/?filter=completed', current: null },
    ]);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Active' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Completed' })).not.toHaveAttribute('aria-current');
  });
});
