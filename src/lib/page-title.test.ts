import { describe, expect, it } from 'vitest';
import { pageTitle } from './page-title';

describe('pageTitle (§26)', () => {
  it('AC-26.1: returns "Todos", "(1) Todos", "(2) Todos", "(11) Todos", "(1000) Todos" for 0, 1, 2, 11, 1000', () => {
    const counts = [0, 1, 2, 11, 1000];

    const titles = counts.map((count) => pageTitle(count));

    expect(titles).toEqual(['Todos', '(1) Todos', '(2) Todos', '(11) Todos', '(1000) Todos']);
  });
});
