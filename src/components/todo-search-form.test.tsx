import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSearchInEffect } from '@/lib/clear-search';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoSearchForm } from './todo-search-form';

// TodoSearchForm is a native GET form; §25 makes it a client component (a ref and a keydown effect on `document`), but
// it renders synchronously and imports no action: nothing to mock.
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

// A cancelable `/` keydown dispatched on `target` (it bubbles to `document`, where §25 listens), as a browser sends it.
function pressKey(target: Element, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

function focusBody(): void {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function searchBox(): HTMLElement {
  return screen.getByRole('searchbox', { name: 'Search todos' });
}

describe('<TodoSearchForm> slash key shortcut (§25)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('AC-25.2: on (all, milk) with body focused, / makes "Search todos" the active element, its value stays milk, defaultPrevented is true, 0 requests and 0 navigations', () => {
    renderForm('all', 'milk');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const submits: Event[] = [];
    screen.getByRole('search').addEventListener('submit', (event) => submits.push(event));
    const addressBefore = window.location.href;
    focusBody();
    expect(document.activeElement).toBe(document.body);

    const event = pressKey(document.body);

    expect(document.activeElement).toBe(searchBox());
    expect(searchBox()).toHaveValue('milk');
    expect(event.defaultPrevented).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(0);
    expect(submits).toHaveLength(0);
    expect(window.location.href).toBe(addressBefore);
  });

  it('AC-25.3: / pressed on the focused "Search" button, the focused "Clear search" link and a focused checkbox each time makes "Search todos" the active element with defaultPrevented true', () => {
    render(
      <>
        <input type="checkbox" aria-label="Buy milk" />
        <TodoSearchForm filter="all" query="milk" />
      </>,
    );
    const targets: readonly HTMLElement[] = [
      screen.getByRole('button', { name: 'Search' }),
      screen.getByRole('link', { name: 'Clear search' }),
      screen.getByRole('checkbox', { name: 'Buy milk' }),
    ];

    const outcomes = targets.map((target) => {
      target.focus();
      const focusedBefore = document.activeElement === target;
      const event = pressKey(target);
      return { focusedBefore, activeIsBox: document.activeElement === searchBox(), prevented: event.defaultPrevented };
    });

    expect(outcomes).toEqual([
      { focusedBefore: true, activeIsBox: true, prevented: true },
      { focusedBefore: true, activeIsBox: true, prevented: true },
      { focusedBefore: true, activeIsBox: true, prevented: true },
    ]);
  });

  it('AC-25.4: / in the "New todo" box leaves focus there with defaultPrevented false; Ctrl+/, Meta+/ and Alt+/ on body leave "Search todos" unfocused with defaultPrevented false; / inside "Search todos" keeps focus there with defaultPrevented false', () => {
    render(
      <>
        <input type="text" aria-label="New todo" />
        <TodoSearchForm filter="all" query="" />
      </>,
    );
    const newTodo = screen.getByRole('textbox', { name: 'New todo' });
    newTodo.focus();

    const inNewTodo = pressKey(newTodo);

    expect(inNewTodo.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(newTodo);
    expect(document.activeElement).not.toBe(searchBox());

    const modifiers: readonly KeyboardEventInit[] = [{ ctrlKey: true }, { metaKey: true }, { altKey: true }];
    for (const modifier of modifiers) {
      focusBody();

      const withModifier = pressKey(document.body, modifier);

      expect(document.activeElement).not.toBe(searchBox());
      expect(document.activeElement).toBe(document.body);
      expect(withModifier.defaultPrevented).toBe(false);
    }

    // Control: the listener is live, so the cases above were left alone by rule, not for lack of a listener.
    focusBody();
    const plain = pressKey(document.body);
    expect(document.activeElement).toBe(searchBox());
    expect(plain.defaultPrevented).toBe(true);

    const inBox = pressKey(searchBox());

    expect(document.activeElement).toBe(searchBox());
    expect(inBox.defaultPrevented).toBe(false);
  });

  it('AC-25.5: after an unmount / focuses nothing (activeElement is body) with defaultPrevented false; after mount, unmount, mount one / calls focus on "Search todos" exactly once', () => {
    const first = renderForm('all', '');
    first.unmount();
    focusBody();

    const afterUnmount = pressKey(document.body);

    expect(document.activeElement).toBe(document.body);
    expect(afterUnmount.defaultPrevented).toBe(false);

    renderForm('all', '');
    const focusSpy = vi.spyOn(searchBox(), 'focus');
    focusBody();

    const afterRemount = pressKey(document.body);

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(searchBox());
    expect(afterRemount.defaultPrevented).toBe(true);
  });
});
