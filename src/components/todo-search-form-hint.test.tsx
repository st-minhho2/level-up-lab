import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoSearchForm } from './todo-search-form';

// §50: the search box carries the hint "Press / to search" as its placeholder. TodoSearchForm renders synchronously
// and imports no action, so nothing is mocked (as todo-search-form-select.test.tsx).
const HINT = 'Press / to search';

function renderForm(filter: TodoFilter, query: string, count?: number): ReturnType<typeof render> {
  return render(<TodoSearchForm filter={filter} query={query} count={count} />);
}

function searchForm(): HTMLElement {
  return screen.getByRole('search');
}

interface NameAndTextReading {
  readonly boxesByLabel: number;
  readonly boxesByHint: number;
  readonly elementsWithHintText: number;
  readonly textContent: string | null;
  readonly describedBy: number;
  readonly titled: number;
}

// Reads the rendered form by role, by name and by text, as AC-50.2 lists them.
function readNameAndText(): NameAndTextReading {
  const form = searchForm();
  return {
    boxesByLabel: screen.queryAllByRole('searchbox', { name: 'Search todos' }).length,
    boxesByHint: screen.queryAllByRole('searchbox', { name: HINT }).length,
    elementsWithHintText: screen.queryAllByText(HINT).length,
    textContent: form.textContent,
    describedBy: form.querySelectorAll('[aria-describedby]').length,
    titled: form.querySelectorAll('[title]').length,
  };
}

describe('<TodoSearchForm> the search box shows the / hint (§50)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('AC-50.2: in (all, \'\') and (active, milk, count 1) the box is found by the name "Search todos" once and by the hint 0 times, 0 elements have the hint as text, the form text is exactly "Search todosSearch" then "Search todosSearchClear search1 match", and 0 [aria-describedby] and 0 [title] elements', () => {
    const first = renderForm('all', '');

    const emptyReading = readNameAndText();

    expect(emptyReading).toEqual({
      boxesByLabel: 1,
      boxesByHint: 0,
      elementsWithHintText: 0,
      textContent: 'Search todosSearch',
      describedBy: 0,
      titled: 0,
    });

    first.unmount();
    renderForm('active', 'milk', 1);

    const searchReading = readNameAndText();

    expect(searchReading).toEqual({
      boxesByLabel: 1,
      boxesByHint: 0,
      elementsWithHintText: 0,
      textContent: 'Search todosSearchClear search1 match',
      describedBy: 0,
      titled: 0,
    });
  });
});
