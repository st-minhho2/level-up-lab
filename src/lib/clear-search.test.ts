import { describe, expect, it } from 'vitest';
import { CLEAR_SEARCH_LABEL, clearSearchHref, isSearchInEffect } from './clear-search';
import type { TodoFilter } from './todo-filter';

// Pure module (no Prisma, no server-only): nothing to mock.
describe('clearSearchHref, CLEAR_SEARCH_LABEL, isSearchInEffect (§21)', () => {
  it("AC-21.1: '/', '/?filter=active', '/?filter=completed' for all, active, completed, none containing q=; CLEAR_SEARCH_LABEL is exactly 'Clear search'", () => {
    const filters: readonly TodoFilter[] = ['all', 'active', 'completed'];

    const hrefs = filters.map((filter) => clearSearchHref(filter));

    expect(hrefs).toEqual(['/', '/?filter=active', '/?filter=completed']);
    expect(hrefs.filter((href) => href.includes('q='))).toEqual([]);
    expect(CLEAR_SEARCH_LABEL).toBe('Clear search');
  });

  it("AC-21.2: true, true, true, false, false, false for 'milk', '  milk  ', 'x' repeated 201 times, '', '   ', '\\t\\n'; it never throws", () => {
    const cases: readonly (readonly [string, boolean])[] = [
      ['milk', true],
      ['  milk  ', true],
      ['x'.repeat(201), true],
      ['', false],
      ['   ', false],
      ['\t\n', false],
    ];

    const results = cases.map(([query]) => isSearchInEffect(query));

    expect(results).toEqual(cases.map(([, expected]) => expected));
    for (const [query] of cases) {
      expect(() => isSearchInEffect(query)).not.toThrow();
    }
  });
});
