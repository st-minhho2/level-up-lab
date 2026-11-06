import { describe, expect, it } from 'vitest';
import { isSearchEscape, SEARCH_ESCAPE_KEY, type EscapeEvent } from './escape-search';

// Pure module (no Prisma, no server-only, no DOM): plain-object events, nothing to mock.
function keyEvent(overrides: Partial<EscapeEvent> = {}): EscapeEvent {
  return { key: 'Escape', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...overrides };
}

describe('isSearchEscape (§27)', () => {
  it("AC-27.1: 'Escape' with no modifier is true; 'Escape' with ctrlKey, metaKey, altKey or shiftKey is false; 'Enter', '/', 'Esc', 'escape' and '' are false; SEARCH_ESCAPE_KEY is 'Escape'; no call throws", () => {
    const cases: readonly (readonly [EscapeEvent, boolean])[] = [
      [keyEvent(), true],
      [keyEvent({ ctrlKey: true }), false],
      [keyEvent({ metaKey: true }), false],
      [keyEvent({ altKey: true }), false],
      [keyEvent({ shiftKey: true }), false],
      [keyEvent({ key: 'Enter' }), false],
      [keyEvent({ key: '/' }), false],
      [keyEvent({ key: 'Esc' }), false],
      [keyEvent({ key: 'escape' }), false],
      [keyEvent({ key: '' }), false],
    ];

    const results = cases.map(([event]) => isSearchEscape(event));

    expect(results).toEqual(cases.map(([, expected]) => expected));
    expect(SEARCH_ESCAPE_KEY).toBe('Escape');
    for (const [event] of cases) {
      expect(() => isSearchEscape(event)).not.toThrow();
    }
  });
});
