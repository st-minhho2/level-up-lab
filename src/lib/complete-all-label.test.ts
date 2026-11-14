import { describe, expect, it } from 'vitest';
import { completeAllLabel } from './complete-all-label';

describe('completeAllLabel (§36)', () => {
  it('AC-36.1: writes "Mark all complete" for 0, "Mark all complete (1)" for 1 and "Mark all complete (12)" for 12', () => {
    const counts = [0, 1, 12];

    const labels = counts.map((open) => completeAllLabel(open));

    expect(labels).toEqual(['Mark all complete', 'Mark all complete (1)', 'Mark all complete (12)']);
  });
});
