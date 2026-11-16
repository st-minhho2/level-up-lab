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

// Each link of the navigation, in document order, with the element that directly follows it.
function linksWithCounts(): LinkWithCount[] {
  return within(filterNav())
    .queryAllByRole('link')
    .map((link) => ({
      name: link.textContent,
      href: link.getAttribute('href'),
      current: link.getAttribute('aria-current'),
      followingTag: link.nextElementSibling?.tagName,
      followingText: link.nextElementSibling?.textContent,
    }));
}

function counts(all: number, active: number, completed: number): FilterCounts {
  return { all, active, completed };
}

function renderNavWithCounts(selected: TodoFilter, value: FilterCounts): ReturnType<typeof render> {
  return render(<TodoFilterNav selected={selected} counts={value} />);
}

describe('<TodoFilterNav> hides a link whose count is 0 (§42)', () => {
  it('AC-42.2: the selected link stays with its (0) span: All, Active, Completed with (3), (0), (3) and aria-current only on Active, then All, Active, Completed with (2), (2), (0) and aria-current only on Completed', () => {
    const first = renderNavWithCounts('active', counts(3, 0, 3));

    expect(linksWithCounts()).toEqual([
      { name: 'All', href: '/', current: null, followingTag: 'SPAN', followingText: '(3)' },
      { name: 'Active', href: '/?filter=active', current: 'page', followingTag: 'SPAN', followingText: '(0)' },
      { name: 'Completed', href: '/?filter=completed', current: null, followingTag: 'SPAN', followingText: '(3)' },
    ]);

    first.unmount();
    renderNavWithCounts('completed', counts(2, 2, 0));

    expect(linksWithCounts()).toEqual([
      { name: 'All', href: '/', current: null, followingTag: 'SPAN', followingText: '(2)' },
      { name: 'Active', href: '/?filter=active', current: null, followingTag: 'SPAN', followingText: '(2)' },
      { name: 'Completed', href: '/?filter=completed', current: 'page', followingTag: 'SPAN', followingText: '(0)' },
    ]);
  });
});
