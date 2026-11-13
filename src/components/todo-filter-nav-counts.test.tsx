import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TodoFilter } from '@/lib/todo-filter';
import { TodoFilterNav } from './todo-filter-nav';

function filterNav(): HTMLElement {
  return screen.getByRole('navigation', { name: 'Filter todos' });
}

function linkNames(): (string | null)[] {
  return within(filterNav())
    .getAllByRole('link')
    .map((link) => link.textContent);
}

function renderNav(selected: TodoFilter): ReturnType<typeof render> {
  return render(<TodoFilterNav selected={selected} />);
}

describe('<TodoFilterNav> counts (§30)', () => {
  it('AC-30.4: without counts, 3 links All, Active, Completed, 0 spans inside the navigation, and the navigation reads "AllActiveCompleted"', () => {
    renderNav('all');

    expect(linkNames()).toEqual(['All', 'Active', 'Completed']);
    expect(filterNav().querySelectorAll('span')).toHaveLength(0);
    expect(filterNav().textContent).toBe('AllActiveCompleted');
  });
});
