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
    .queryAllByRole('link')
    .map((link) => link.textContent);
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

// The text of every <span> inside the navigation, in document order.
function spanTexts(): (string | null)[] {
  return Array.from(filterNav().querySelectorAll('span')).map((span) => span.textContent);
}

function counts(all: number, active: number, completed: number): FilterCounts {
  return { all, active, completed };
}

function renderNavWithCounts(selected: TodoFilter, value: FilterCounts): ReturnType<typeof render> {
  return render(<TodoFilterNav selected={selected} counts={value} />);
}

describe('<TodoFilterNav> hides a link whose count is 0 (§42)', () => {
  it('AC-42.1: 2 links All and Completed to / and /?filter=completed, each directly followed by a span reading (4), 0 links Active, 2 spans, the navigation reads "All(4)Completed(4)", 0 hidden or aria-hidden elements, aria-current only on All', () => {
    renderNavWithCounts('all', counts(4, 0, 4));

    expect(linksWithCounts()).toEqual([
      { name: 'All', href: '/', current: 'page', followingTag: 'SPAN', followingText: '(4)' },
      { name: 'Completed', href: '/?filter=completed', current: null, followingTag: 'SPAN', followingText: '(4)' },
    ]);
    expect(within(filterNav()).queryAllByRole('link', { name: 'Active' })).toHaveLength(0);
    expect(filterNav().querySelectorAll('span')).toHaveLength(2);
    expect(filterNav().textContent).toBe('All(4)Completed(4)');
    expect(filterNav().querySelectorAll('[hidden], [aria-hidden]')).toHaveLength(0);
  });

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

  it('AC-42.3: with all counts 0 and All, Active, then Completed selected, each time 1 "Filter todos" navigation holding exactly 1 link, the selected one to /, /?filter=active, /?filter=completed with aria-current="page", and 1 span reading (0); 0 listitem, 0 button', () => {
    const cases: readonly { selected: TodoFilter; name: string; href: string }[] = [
      { selected: 'all', name: 'All', href: '/' },
      { selected: 'active', name: 'Active', href: '/?filter=active' },
      { selected: 'completed', name: 'Completed', href: '/?filter=completed' },
    ];

    for (const { selected, name, href } of cases) {
      const view = renderNavWithCounts(selected, counts(0, 0, 0));

      expect(screen.getAllByRole('navigation', { name: 'Filter todos' })).toHaveLength(1);
      expect(linksWithCounts()).toEqual([{ name, href, current: 'page', followingTag: 'SPAN', followingText: '(0)' }]);
      expect(spanTexts()).toEqual(['(0)']);
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
      expect(screen.queryAllByRole('button')).toHaveLength(0);

      view.unmount();
    }
  });

  it('AC-42.4: on re-render the links read [All, Completed], [All, Active, Completed], [Completed], [All, Active, Completed], the spans read [(5), (5)], [(5), (1), (4)], [(0)], then none, and the navigation finally reads "AllActiveCompleted"', () => {
    const view = renderNavWithCounts('completed', counts(5, 0, 5));

    expect(linkNames()).toEqual(['All', 'Completed']);
    expect(spanTexts()).toEqual(['(5)', '(5)']);

    view.rerender(<TodoFilterNav selected="completed" counts={counts(5, 1, 4)} />);

    expect(linkNames()).toEqual(['All', 'Active', 'Completed']);
    expect(spanTexts()).toEqual(['(5)', '(1)', '(4)']);

    view.rerender(<TodoFilterNav selected="completed" counts={counts(0, 0, 0)} />);

    expect(linkNames()).toEqual(['Completed']);
    expect(spanTexts()).toEqual(['(0)']);

    view.rerender(<TodoFilterNav selected="completed" />);

    expect(linkNames()).toEqual(['All', 'Active', 'Completed']);
    expect(spanTexts()).toEqual([]);
    expect(filterNav().textContent).toBe('AllActiveCompleted');
  });
});
