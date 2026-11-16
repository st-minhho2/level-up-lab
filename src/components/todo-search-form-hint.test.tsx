import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
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

function searchBox(): HTMLInputElement {
  const box = screen.getByRole('searchbox', { name: 'Search todos' });
  if (!(box instanceof HTMLInputElement)) {
    throw new Error('"Search todos" is not an <input>');
  }
  return box;
}

// A cancelable keydown dispatched on `target` (it bubbles to `document`, where §25 listens), as a browser sends it.
function pressKey(target: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

function focusBody(): void {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

// Counts clicks on the "Clear search" link; the default is prevented so jsdom does not navigate.
function countClearLinkClicks(): { readonly count: () => number } {
  let clicks = 0;
  screen.getByRole('link', { name: 'Clear search' }).addEventListener('click', (event) => {
    event.preventDefault();
    clicks += 1;
  });
  return { count: () => clicks };
}

// The server renderer's string (no effect runs, no event is attached), parsed back into a document.
function renderServerDocument(filter: TodoFilter, query: string): { readonly html: string; readonly doc: Document } {
  const html = renderToStaticMarkup(<TodoSearchForm filter={filter} query={query} />);
  return { html, doc: new DOMParser().parseFromString(html, 'text/html') };
}

function occurrences(text: string, part: string): number {
  return text.split(part).length - 1;
}

describe('<TodoSearchForm> the search box shows the / hint (§50)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('AC-50.1: with (all, \'\') exactly 1 "Search todos" searchbox whose placeholder is exactly "Press / to search" (length 17), id search-todos, name q, type search, maxlength 200, value \'\', and no aria-label, aria-labelledby, aria-describedby or title', () => {
    renderForm('all', '');

    const boxes = screen.getAllByRole('searchbox', { name: 'Search todos' });

    expect(boxes).toHaveLength(1);
    const box = searchBox();
    expect(box.getAttribute('placeholder')).toBe(HINT);
    expect(box.getAttribute('placeholder')?.length).toBe(17);
    expect(box.getAttribute('id')).toBe('search-todos');
    expect(box.getAttribute('name')).toBe('q');
    expect(box.getAttribute('type')).toBe('search');
    expect(box.getAttribute('maxlength')).toBe('200');
    expect(box.value).toBe('');
    expect(box.hasAttribute('aria-label')).toBe(false);
    expect(box.hasAttribute('aria-labelledby')).toBe(false);
    expect(box.hasAttribute('aria-describedby')).toBe(false);
    expect(box.hasAttribute('title')).toBe(false);
  });

  it("AC-50.3: with count 3 in (all, ''), (completed, ''), (active, milk) and (all, 'Café 😀') the placeholder is exactly \"Press / to search\", the value is the query given, and the hidden filter input is present only for completed and active", () => {
    const cases: readonly { readonly filter: TodoFilter; readonly query: string }[] = [
      { filter: 'all', query: '' },
      { filter: 'completed', query: '' },
      { filter: 'active', query: 'milk' },
      { filter: 'all', query: 'Café 😀' },
    ];

    const outcomes = cases.map(({ filter, query }) => {
      const { container, unmount } = renderForm(filter, query, 3);
      const outcome = {
        placeholder: searchBox().getAttribute('placeholder'),
        value: searchBox().value,
        hiddenFilterInputs: container.querySelectorAll('input[type="hidden"][name="filter"]').length,
      };
      unmount();
      return outcome;
    });

    expect(outcomes).toEqual([
      { placeholder: HINT, value: '', hiddenFilterInputs: 0 },
      { placeholder: HINT, value: '', hiddenFilterInputs: 1 },
      { placeholder: HINT, value: 'milk', hiddenFilterInputs: 1 },
      { placeholder: HINT, value: 'Café 😀', hiddenFilterInputs: 0 },
    ]);
  });

  it('AC-50.4: the server renderer\'s markup for (all, \'\') and (active, milk) has the q input with placeholder "Press / to search", the label for search-todos reading "Search todos", a GET form to / and a submit "Search" button; the first string has placeholder="Press / to search" exactly once', () => {
    const renders = [renderServerDocument('all', ''), renderServerDocument('active', 'milk')];

    const readings = renders.map(({ doc }) => {
      const buttons = Array.from(doc.querySelectorAll('button')).filter((button) => button.textContent === 'Search');
      return {
        placeholder: doc.querySelector('input[name="q"]')?.getAttribute('placeholder'),
        label: doc.querySelector('label[for="search-todos"]')?.textContent,
        method: doc.querySelector('form')?.getAttribute('method'),
        action: doc.querySelector('form')?.getAttribute('action'),
        searchButtonTypes: buttons.map((button) => button.getAttribute('type')),
      };
    });

    const expected = {
      placeholder: HINT,
      label: 'Search todos',
      method: 'get',
      action: '/',
      searchButtonTypes: ['submit'],
    };
    expect(readings).toEqual([expected, expected]);
    expect(occurrences(renders[0]?.html ?? '', `placeholder="${HINT}"`)).toBe(1);
  });

  it("AC-50.5: Escape in the box after milkx on (active, milk) and after zzz on (all, '') each leaves the value '', defaultPrevented true and the placeholder \"Press / to search\"; the link gets exactly 1 click the first time, the second render has 0 links, and 0 requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    const first = renderForm('active', 'milk');
    await user.clear(searchBox());
    await user.type(searchBox(), 'milkx');
    expect(searchBox().value).toBe('milkx');
    const clearLink = countClearLinkClicks();

    const withSearch = pressKey(searchBox(), 'Escape');

    expect(searchBox().value).toBe('');
    expect(withSearch.defaultPrevented).toBe(true);
    expect(searchBox().getAttribute('placeholder')).toBe(HINT);
    expect(clearLink.count()).toBe(1);

    first.unmount();
    renderForm('all', '');
    await user.type(searchBox(), 'zzz');
    expect(searchBox().value).toBe('zzz');

    const withoutSearch = pressKey(searchBox(), 'Escape');

    expect(searchBox().value).toBe('');
    expect(withoutSearch.defaultPrevented).toBe(true);
    expect(searchBox().getAttribute('placeholder')).toBe(HINT);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(fetchSpy).toHaveBeenCalledTimes(0);
  });

  it("AC-50.6: / on body with (all, milk) focuses the box with selection 0 to 4, value milk, defaultPrevented true, the form's innerHTML unchanged and the placeholder \"Press / to search\"; with (all, '') it focuses the box with value '' and selection 0 to 0, defaultPrevented true; / inside the box leaves defaultPrevented false", () => {
    const first = renderForm('all', 'milk');
    const markupBefore = searchForm().innerHTML;
    focusBody();

    const onMilk = pressKey(document.body, '/');

    expect(document.activeElement).toBe(searchBox());
    expect({ start: searchBox().selectionStart, end: searchBox().selectionEnd }).toEqual({ start: 0, end: 4 });
    expect(searchBox().value).toBe('milk');
    expect(onMilk.defaultPrevented).toBe(true);
    expect(searchForm().innerHTML).toBe(markupBefore);
    expect(searchBox().getAttribute('placeholder')).toBe(HINT);

    const insideBox = pressKey(searchBox(), '/');

    expect(insideBox.defaultPrevented).toBe(false);

    first.unmount();
    renderForm('all', '');
    focusBody();

    const onEmpty = pressKey(document.body, '/');

    expect(document.activeElement).toBe(searchBox());
    expect(searchBox().value).toBe('');
    expect({ start: searchBox().selectionStart, end: searchBox().selectionEnd }).toEqual({ start: 0, end: 0 });
    expect(onEmpty.defaultPrevented).toBe(true);
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
