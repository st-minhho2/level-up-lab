import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoSearchForm } from './todo-search-form';

// §46: the `/` shortcut of §25 also selects the box's whole text. TodoSearchForm renders synchronously and imports no
// action, so nothing is mocked; spies sit on the box element itself (focus, select) and on `fetch`.
function renderForm(filter: TodoFilter, query: string): ReturnType<typeof render> {
  return render(<TodoSearchForm filter={filter} query={query} />);
}

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

function searchBox(): HTMLInputElement {
  const box = screen.getByRole('searchbox', { name: 'Search todos' });
  if (!(box instanceof HTMLInputElement)) {
    throw new Error('"Search todos" is not an <input>');
  }
  return box;
}

interface SelectionState {
  readonly selectionStart: number | null;
  readonly selectionEnd: number | null;
}

function selectionOf(field: HTMLInputElement): SelectionState {
  return { selectionStart: field.selectionStart, selectionEnd: field.selectionEnd };
}

describe('<TodoSearchForm> the slash key selects the search text (§46)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('AC-46.1: on (all, milk) with body focused, / makes "Search todos" the active element with value milk, selectionStart 0 and selectionEnd 4, defaultPrevented true, 0 requests and 0 submits', () => {
    renderForm('all', 'milk');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const submits: Event[] = [];
    screen.getByRole('search').addEventListener('submit', (event) => submits.push(event));
    focusBody();
    expect(document.activeElement).toBe(document.body);

    const event = pressKey(document.body);

    expect(document.activeElement).toBe(searchBox());
    expect(searchBox().value).toBe('milk');
    expect(selectionOf(searchBox())).toEqual({ selectionStart: 0, selectionEnd: 4 });
    expect(event.defaultPrevented).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(0);
    expect(submits).toHaveLength(0);
  });

  it('AC-46.2: (a) on (all, \'Café 😀\') / on body selects 0 to 7; (b) on (all, milk) with x typed at the end and the "Search" button focused, / leaves the value milkx, the box active and the selection 0 to 5', async () => {
    const emojiQuery = 'Café 😀';
    const first = renderForm('all', emojiQuery);
    expect(searchBox().value.length).toBe(7);
    focusBody();

    pressKey(document.body);

    expect(document.activeElement).toBe(searchBox());
    expect(selectionOf(searchBox())).toEqual({ selectionStart: 0, selectionEnd: 7 });

    first.unmount();
    const user = userEvent.setup();
    renderForm('all', 'milk');
    await user.type(searchBox(), 'x', { initialSelectionStart: 4, initialSelectionEnd: 4 });
    expect(searchBox().value).toBe('milkx');
    const searchButton = screen.getByRole('button', { name: 'Search' });
    searchButton.focus();
    expect(document.activeElement).toBe(searchButton);

    pressKey(searchButton);

    expect(searchBox().value).toBe('milkx');
    expect(document.activeElement).toBe(searchBox());
    expect(selectionOf(searchBox())).toEqual({ selectionStart: 0, selectionEnd: 5 });
  });

  it('AC-46.3: with an empty box / on body leaves value \'\' and selection 0 to 0; on (active, milk) / on "Clear search", a checkbox and "Search" each selects 0 to 4; every defaultPrevented is true and the form\'s innerHTML is unchanged', () => {
    const empty = renderForm('all', '');
    const emptyForm = screen.getByRole('search');
    const emptyMarkupBefore = emptyForm.innerHTML;
    focusBody();

    const onEmpty = pressKey(document.body);

    expect(document.activeElement).toBe(searchBox());
    expect(searchBox().value).toBe('');
    expect(selectionOf(searchBox())).toEqual({ selectionStart: 0, selectionEnd: 0 });
    expect(onEmpty.defaultPrevented).toBe(true);
    expect(emptyForm.innerHTML).toBe(emptyMarkupBefore);

    empty.unmount();
    render(
      <>
        <input type="checkbox" aria-label="Buy milk" />
        <TodoSearchForm filter="active" query="milk" />
      </>,
    );
    const form = screen.getByRole('search');
    const markupBefore = form.innerHTML;
    const targets: readonly HTMLElement[] = [
      screen.getByRole('link', { name: 'Clear search' }),
      screen.getByRole('checkbox', { name: 'Buy milk' }),
      screen.getByRole('button', { name: 'Search' }),
    ];

    const outcomes = targets.map((target) => {
      target.focus();
      const focusedBefore = document.activeElement === target;
      const event = pressKey(target);
      return {
        focusedBefore,
        activeIsBox: document.activeElement === searchBox(),
        ...selectionOf(searchBox()),
        prevented: event.defaultPrevented,
        markupUnchanged: form.innerHTML === markupBefore,
      };
    });

    const expected = {
      focusedBefore: true,
      activeIsBox: true,
      selectionStart: 0,
      selectionEnd: 4,
      prevented: true,
      markupUnchanged: true,
    };
    expect(outcomes).toEqual([expected, expected, expected]);
  });

  it('AC-46.4: / in "New todo", / inside "Search todos", and Ctrl+/, Meta+/, Alt+/ on body each leave defaultPrevented false, both selections 1 to 3, the active element where it was, and 0 calls to select of the box', () => {
    render(
      <>
        <input type="text" aria-label="New todo" defaultValue="abcd" />
        <TodoSearchForm filter="all" query="milk" />
      </>,
    );
    const newTodo = screen.getByRole('textbox', { name: 'New todo' });
    if (!(newTodo instanceof HTMLInputElement)) {
      throw new Error('"New todo" is not an <input>');
    }
    const box = searchBox();
    const selectSpy = vi.spyOn(box, 'select');
    newTodo.focus();
    newTodo.setSelectionRange(1, 3);
    box.setSelectionRange(1, 3);

    const inNewTodo = pressKey(newTodo);

    expect(inNewTodo.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(newTodo);
    expect(selectionOf(newTodo)).toEqual({ selectionStart: 1, selectionEnd: 3 });
    expect(selectionOf(box)).toEqual({ selectionStart: 1, selectionEnd: 3 });

    box.focus();
    box.setSelectionRange(1, 3);

    const inBox = pressKey(box);

    expect(inBox.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(box);
    expect(selectionOf(box)).toEqual({ selectionStart: 1, selectionEnd: 3 });

    const modifiers: readonly KeyboardEventInit[] = [{ ctrlKey: true }, { metaKey: true }, { altKey: true }];
    for (const modifier of modifiers) {
      focusBody();
      box.setSelectionRange(1, 3);

      const withModifier = pressKey(document.body, modifier);

      expect(withModifier.defaultPrevented).toBe(false);
      expect(document.activeElement).not.toBe(box);
      expect(selectionOf(box)).toEqual({ selectionStart: 1, selectionEnd: 3 });
    }
    expect(selectSpy).toHaveBeenCalledTimes(0);

    // Control: the listener is live and selects, so the presses above were left alone by rule, not for lack of one.
    focusBody();
    const plain = pressKey(document.body);
    expect(plain.defaultPrevented).toBe(true);
    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(selectionOf(box)).toEqual({ selectionStart: 0, selectionEnd: 4 });
  });

  it('AC-46.5: after an unmount / leaves body active, defaultPrevented false and 0 select calls; after mount, unmount, mount one / calls focus once then select once, in that order', () => {
    const first = renderForm('all', 'milk');
    const unmountedSelectSpy = vi.spyOn(searchBox(), 'select');
    first.unmount();
    focusBody();

    const afterUnmount = pressKey(document.body);

    expect(document.activeElement).toBe(document.body);
    expect(afterUnmount.defaultPrevented).toBe(false);
    expect(unmountedSelectSpy).toHaveBeenCalledTimes(0);

    renderForm('all', 'milk').unmount();
    renderForm('all', 'milk');
    const focusSpy = vi.spyOn(searchBox(), 'focus');
    const selectSpy = vi.spyOn(searchBox(), 'select');
    focusBody();

    pressKey(document.body);

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(selectSpy).toHaveBeenCalledTimes(1);
    const focusOrder = focusSpy.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY;
    const selectOrder = selectSpy.mock.invocationCallOrder[0] ?? Number.NEGATIVE_INFINITY;
    expect(focusOrder).toBeLessThan(selectOrder);
  });
});
