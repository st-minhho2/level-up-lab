import { describe, expect, it } from 'vitest';
import { isSearchShortcut, type ShortcutEvent } from './search-shortcut';

// Pure module (no Prisma, no server-only, no DOM): plain-object events, nothing to mock.
function keyEvent(overrides: Partial<ShortcutEvent> = {}): ShortcutEvent {
  return { key: '/', ctrlKey: false, metaKey: false, altKey: false, target: null, ...overrides };
}

describe('isSearchShortcut (§25)', () => {
  it("AC-25.1: '/' with no modifier on null, BODY, BUTTON, A, a checkbox and a RADIO input is true; on an input without type, text, date, TEXTAREA, SELECT and a contentEditable DIV is false; '/' with ctrlKey, metaKey or altKey is false; '?', 'a', 'Escape', '' are false; it never throws", () => {
    const cases: readonly (readonly [ShortcutEvent, boolean])[] = [
      [keyEvent({ target: null }), true],
      [keyEvent({ target: { tagName: 'BODY' } }), true],
      [keyEvent({ target: { tagName: 'BUTTON' } }), true],
      [keyEvent({ target: { tagName: 'A' } }), true],
      [keyEvent({ target: { tagName: 'INPUT', type: 'checkbox' } }), true],
      [keyEvent({ target: { tagName: 'INPUT', type: 'RADIO' } }), true],
      [keyEvent({ target: { tagName: 'INPUT' } }), false],
      [keyEvent({ target: { tagName: 'INPUT', type: 'text' } }), false],
      [keyEvent({ target: { tagName: 'INPUT', type: 'date' } }), false],
      [keyEvent({ target: { tagName: 'TEXTAREA' } }), false],
      [keyEvent({ target: { tagName: 'SELECT' } }), false],
      [keyEvent({ target: { tagName: 'DIV', isContentEditable: true } }), false],
      [keyEvent({ ctrlKey: true }), false],
      [keyEvent({ metaKey: true }), false],
      [keyEvent({ altKey: true }), false],
      [keyEvent({ key: '?' }), false],
      [keyEvent({ key: 'a' }), false],
      [keyEvent({ key: 'Escape' }), false],
      [keyEvent({ key: '' }), false],
    ];

    const results = cases.map(([event]) => isSearchShortcut(event));

    expect(results).toEqual(cases.map(([, expected]) => expected));
    for (const [event] of cases) {
      expect(() => isSearchShortcut(event)).not.toThrow();
    }
  });
});
