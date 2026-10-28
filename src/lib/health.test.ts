import { describe, expect, it } from 'vitest';
import { healthReport } from './health';

describe('healthReport', () => {
  it('reports status ok with uptime floored to whole seconds', () => {
    expect(healthReport(12.7)).toEqual({ status: 'ok', uptimeSeconds: 12 });
  });

  it('reports 0 for a process that just started', () => {
    expect(healthReport(0)).toEqual({ status: 'ok', uptimeSeconds: 0 });
  });

  it('clamps a negative uptime to 0', () => {
    expect(healthReport(-3.2)).toEqual({ status: 'ok', uptimeSeconds: 0 });
  });

  it('exposes exactly the keys status and uptimeSeconds', () => {
    expect(Object.keys(healthReport(5)).sort()).toEqual(['status', 'uptimeSeconds']);
  });
});
