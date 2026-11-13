import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FilterCounts } from '@/lib/filter-counts';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoFilterNav } from './todo-filter-nav';

interface LinkWithCount {
  readonly name: string | null;
  readonly href: string | null;
  readonly current: string | null;
  readonly followingTag: string | undefined;
  readonly followingText: string | null | undefined;
}

function filterNav(): HTMLElement {
  return screen.getByRole('navigation', { name: 'Filter todos' });
}

function linkNames(): (string | null)[] {
  return within(filterNav())
    .getAllByRole('link')
    .map((link) => link.textContent);
}

// Each link of the navigation, in document order, with the element that directly follows it.
function linksWithCounts(): LinkWithCount[] {
  return within(filterNav())
    .getAllByRole('link')
    .map((link) => ({
      name: link.textContent,
      href: link.getAttribute('href'),
      current: link.getAttribute('aria-current'),
      followingTag: link.nextElementSibling?.tagName,
      followingText: link.nextElementSibling?.textContent,
    }));
}

// The text of each link's directly following <span>, in link order.
function countTexts(): (string | null | undefined)[] {
  return within(filterNav())
    .getAllByRole('link')
    .map((link) => (link.nextElementSibling?.tagName === 'SPAN' ? link.nextElementSibling.textContent : undefined));
}

function counts(all: number, active: number, completed: number): FilterCounts {
  return { all, active, completed };
}

function renderNav(selected: TodoFilter): ReturnType<typeof render> {
  return render(<TodoFilterNav selected={selected} />);
}

function renderNavWithCounts(selected: TodoFilter, value: FilterCounts): ReturnType<typeof render> {
  return render(<TodoFilterNav selected={selected} counts={value} />);
}

describe('<TodoFilterNav> counts (§30)', () => {
  it('AC-30.2: 3 links All, Active, Completed to /, /?filter=active, /?filter=completed, each directly followed by a span reading (4), (2), (2), aria-current only on Active, 0 listitem, 0 button, 3 link roles', () => {
    renderNavWithCounts('active', counts(4, 2, 2));

    expect(linksWithCounts()).toEqual([
      { name: 'All', href: '/', current: null, followingTag: 'SPAN', followingText: '(4)' },
      { name: 'Active', href: '/?filter=active', current: 'page', followingTag: 'SPAN', followingText: '(2)' },
      {
        name: 'Completed',
        href: '/?filter=completed',
        current: null,
        followingTag: 'SPAN',
        followingText: '(2)',
      },
    ]);
    expect(within(filterNav()).getByRole('link', { name: 'All' })).toHaveAccessibleName('All');
    expect(within(filterNav()).getByRole('link', { name: 'Active' })).toHaveAccessibleName('Active');
    expect(within(filterNav()).getByRole('link', { name: 'Completed' })).toHaveAccessibleName('Completed');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('AC-30.3: the three spans read (0), (0), (0), then (12), (10), (2)', () => {
    const view = renderNavWithCounts('all', counts(0, 0, 0));

    expect(countTexts()).toEqual(['(0)', '(0)', '(0)']);

    view.rerender(<TodoFilterNav selected="all" counts={counts(12, 10, 2)} />);

    expect(countTexts()).toEqual(['(12)', '(10)', '(2)']);
  });

  it('AC-30.4: without counts, 3 links All, Active, Completed, 0 spans inside the navigation, and the navigation reads "AllActiveCompleted"', () => {
    renderNav('all');

    expect(linkNames()).toEqual(['All', 'Active', 'Completed']);
    expect(filterNav().querySelectorAll('span')).toHaveLength(0);
    expect(filterNav().textContent).toBe('AllActiveCompleted');
  });
});
