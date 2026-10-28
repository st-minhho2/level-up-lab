export interface HealthReport {
  readonly status: 'ok';
  readonly uptimeSeconds: number;
}

// Whole seconds since process start, never negative. Pure so it is unit-testable and mutation-testable.
export function healthReport(uptime: number): HealthReport {
  return { status: 'ok', uptimeSeconds: Math.max(0, Math.floor(uptime)) };
}
