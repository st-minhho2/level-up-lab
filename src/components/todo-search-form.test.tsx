import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
