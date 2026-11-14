import { describe, expect, it } from 'vitest';
import { clearCompletedLabel } from './clear-completed-label';

describe('clearCompletedLabel (§32)', () => {
  it('AC-32.1: writes "Clear completed" for 0, "Clear completed (1)" for 1 and "Clear completed (12)" for 12', () => {
    const counts = [0, 1, 12];

    const labels = counts.map((completed) => clearCompletedLabel(completed));

    expect(labels).toEqual(['Clear completed', 'Clear completed (1)', 'Clear completed (12)']);
  });
});
