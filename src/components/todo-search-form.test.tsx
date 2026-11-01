import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { isSearchInEffect } from '@/lib/clear-search';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoSearchForm } from './todo-search-form';

// TodoSearchForm is a synchronous Server Component (a native GET form, no state or events), so it renders directly
// and imports no action: nothing to mock.
function renderForm(filter: TodoFilter, query: string): ReturnType<typeof render> {
  return render(<TodoSearchForm filter={filter} query={query} />);
}

// A hidden input has no ARIA role, so it is found by selector (advice, Test strategy).
function hiddenFilterInputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[name="filter"]'));
}

describe('<TodoSearchForm> (§16)', () => {
  it('AC-16.5: with filter all and query \'\' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value \'\'), a submit "Search" button, no list items and no hidden filter input', () => {
    const filter: TodoFilter = 'all';
    const query = '';

    const { container } = renderForm(filter, query);

    const landmarks = screen.getAllByRole('search');
    expect(landmarks).toHaveLength(1);
    expect(landmarks[0]?.tagName).toBe('FORM');
    expect(landmarks[0]).toHaveAttribute('method', 'get');
    expect(landmarks[0]).toHaveAttribute('action', '/');
    const boxes = screen.getAllByRole('searchbox', { name: 'Search todos' });
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toHaveAttribute('name', 'q');
    expect(boxes[0]).toHaveAttribute('maxlength', '200');
    expect(boxes[0]).toHaveValue('');
    const buttons = screen.getAllByRole('button', { name: 'Search' });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('type', 'submit');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(hiddenFilterInputs(container)).toHaveLength(0);
  });

  it('AC-16.5: with filter active and query \'milk\' renders one search landmark, a GET form to /, a "Search todos" searchbox (q, maxlength 200, value \'milk\'), a submit "Search" button, no list items and one hidden filter input with value active', () => {
    const filter: TodoFilter = 'active';
    const query = 'milk';

    const { container } = renderForm(filter, query);

    const landmarks = screen.getAllByRole('search');
    expect(landmarks).toHaveLength(1);
    expect(landmarks[0]?.tagName).toBe('FORM');
    expect(landmarks[0]).toHaveAttribute('method', 'get');
    expect(landmarks[0]).toHaveAttribute('action', '/');
    const boxes = screen.getAllByRole('searchbox', { name: 'Search todos' });
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toHaveAttribute('name', 'q');
    expect(boxes[0]).toHaveAttribute('maxlength', '200');
    expect(boxes[0]).toHaveValue('milk');
    const buttons = screen.getAllByRole('button', { name: 'Search' });
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('type', 'submit');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    const hidden = hiddenFilterInputs(container);
    expect(hidden).toHaveLength(1);
    expect(hidden[0]).toHaveAttribute('type', 'hidden');
    expect(hidden[0]).toHaveValue('active');
  });
});

interface SearchCase {
  readonly filter: TodoFilter;
  readonly query: string;
}

interface ClearLinkCase extends SearchCase {
  readonly href: string;
  readonly hiddenFilterCount: number;
}

describe('<TodoSearchForm> clear search link (§21)', () => {
  it('AC-21.3: with (all, milk), (active, milk), (completed, milk) each render has exactly 1 <a> link "Clear search" with href /, /?filter=active, /?filter=completed, no q=, inside the search landmark after the "Search" button, 0 buttons "Clear search", 1 "Search todos" searchbox with value milk, 1 "Search" button, 0 list items, and a hidden filter input only under active and completed', () => {
    const cases: readonly ClearLinkCase[] = [
      { filter: 'all', query: 'milk', href: '/', hiddenFilterCount: 0 },
      { filter: 'active', query: 'milk', href: '/?filter=active', hiddenFilterCount: 1 },
      { filter: 'completed', query: 'milk', href: '/?filter=completed', hiddenFilterCount: 1 },
    ];

    for (const { filter, query, href, hiddenFilterCount } of cases) {
      const { container, unmount } = renderForm(filter, query);

      const links = screen.getAllByRole('link', { name: 'Clear search' });
      expect(links).toHaveLength(1);
      const link = links[0];
      expect(link?.textContent).toBe('Clear search');
      expect(link?.tagName).toBe('A');
      expect(link?.getAttribute('href')).toBe(href);
      expect(link?.getAttribute('href')).not.toContain('q=');
      const landmarks = screen.getAllByRole('search');
      expect(landmarks).toHaveLength(1);
      expect(link !== undefined && landmarks[0]?.contains(link)).toBe(true);
      const buttons = screen.getAllByRole('button', { name: 'Search' });
      expect(buttons).toHaveLength(1);
      expect(link !== undefined && buttons[0]?.compareDocumentPosition(link)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(screen.queryAllByRole('button', { name: 'Clear search' })).toHaveLength(0);
      const boxes = screen.getAllByRole('searchbox', { name: 'Search todos' });
      expect(boxes).toHaveLength(1);
      expect(boxes[0]).toHaveValue('milk');
      expect(screen.queryAllByRole('listitem')).toHaveLength(0);
      expect(hiddenFilterInputs(container)).toHaveLength(hiddenFilterCount);
      expect(isSearchInEffect(query)).toBe(true);

      unmount();
    }
  });

  it('AC-21.4: with (all, \'\'), (active, \'\'), (completed, \'   \') each render has 0 links inside or outside the search landmark, 0 elements with the text "Clear search", exactly 1 search landmark, 1 "Search todos" searchbox and exactly 1 submit "Search" button', () => {
    const cases: readonly SearchCase[] = [
      { filter: 'all', query: '' },
      { filter: 'active', query: '' },
      { filter: 'completed', query: '   ' },
    ];

    for (const { filter, query } of cases) {
      const { unmount } = renderForm(filter, query);

      expect(screen.queryAllByRole('link')).toHaveLength(0);
      expect(screen.queryAllByText('Clear search')).toHaveLength(0);
      expect(screen.getAllByRole('search')).toHaveLength(1);
      expect(screen.getAllByRole('searchbox', { name: 'Search todos' })).toHaveLength(1);
      const buttons = screen.getAllByRole('button', { name: 'Search' });
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveAttribute('type', 'submit');
      expect(isSearchInEffect(query)).toBe(false);

      unmount();
    }
  });
});
