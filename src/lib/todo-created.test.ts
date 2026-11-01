import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CREATED_PREFIX, createdDayOf, createdLabel } from './todo-created';

let originalTz: string | undefined;

beforeEach(() => {
  originalTz = process.env.TZ;
});

afterEach(() => {
  if (originalTz === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = originalTz;
  }
});

// AC-20.1's instants: both sides of a UTC midnight, the first and last month of the year, and a year padded to 4.
function dayInstants(): Date[] {
  return [
    new Date(Date.UTC(2026, 10, 1, 23, 59, 59, 999)),
    new Date(Date.UTC(2026, 10, 2, 0, 0, 0, 0)),
    new Date(Date.UTC(2026, 0, 5, 12)),
    new Date(Date.UTC(2026, 11, 31, 12)),
    new Date('0005-01-01T00:00:00.000Z'),
  ];
}

function daysUnder(zone: string): string[] {
  process.env.TZ = zone;
  return dayInstants().map((instant) => createdDayOf(instant));
}

// AC-20.2's instants.
function labelInstants(): Date[] {
  return [
    new Date(Date.UTC(2026, 10, 1, 12)),
    new Date(Date.UTC(2026, 11, 31, 23, 59)),
    new Date('0005-01-01T00:00:00.000Z'),
  ];
}

describe('createdDayOf (§20)', () => {
  it("AC-20.1: returns exactly '2026-11-01', '2026-11-02', '2026-01-05', '2026-12-31' and '0005-01-01' under Pacific/Kiritimati and under America/Los_Angeles", () => {
    const kiritimati = daysUnder('Pacific/Kiritimati');
    const losAngeles = daysUnder('America/Los_Angeles');

    expect(kiritimati).toEqual(['2026-11-01', '2026-11-02', '2026-01-05', '2026-12-31', '0005-01-01']);
    expect(losAngeles).toEqual(['2026-11-01', '2026-11-02', '2026-01-05', '2026-12-31', '0005-01-01']);
  });
});

describe('createdLabel (§20)', () => {
  it("AC-20.2: returns exactly 'Created 2026-11-01', 'Created 2026-12-31' and 'Created 0005-01-01', CREATED_PREFIX is exactly 'Created ', and no result contains a ':' or a letter other than the word Created", () => {
    const instants = labelInstants();

    const labels = instants.map((instant) => createdLabel(instant));

    expect(labels).toEqual(['Created 2026-11-01', 'Created 2026-12-31', 'Created 0005-01-01']);
    expect(CREATED_PREFIX).toBe('Created ');
    expect(labels.map((label) => /[:A-Za-z]/.test(label.replace('Created', '')))).toEqual([false, false, false]);
  });
});
