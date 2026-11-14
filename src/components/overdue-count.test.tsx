import { act, render, within } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { OverdueCount } from './overdue-count';

interface Entry {
  readonly completed: boolean;
  readonly dueDate?: string;
}

function open(dueDate?: string): Entry {
  return dueDate === undefined ? { completed: false } : { completed: false, dueDate };
}

function done(dueDate: string): Entry {
  return { completed: true, dueDate };
}

// The local noon of 2026-11-01, so "today" is 2026-11-01 in whatever zone the runner uses.
function firstOfNovember(): Date {
  return new Date(2026, 10, 1, 12, 0, 0);
}

function elementsWithText(scope: HTMLElement, text: string): HTMLElement[] {
  return within(scope).queryAllByText(text, { exact: true });
}

function roleCounts(scope: HTMLElement): Record<string, number> {
  const roles = ['paragraph', 'listitem', 'button', 'link', 'alert'] as const;
  return Object.fromEntries(roles.map((role) => [role, within(scope).queryAllByRole(role).length]));
}

interface StatusSnapshot {
  readonly count: number;
  readonly text: string | null | undefined;
  readonly childNodes: number | undefined;
}

function statusesIn(scope: HTMLElement): HTMLElement[] {
  return within(scope).queryAllByRole('status');
}

function snapshotStatuses(scope: HTMLElement): StatusSnapshot {
  const statuses = statusesIn(scope);
  return { count: statuses.length, text: statuses[0]?.textContent, childNodes: statuses[0]?.childNodes.length };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(firstOfNovember());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('<OverdueCount> (§23)', () => {
  it('AC-23.3: shows exactly 1 element reading "2 overdue" that is not a P and has no role or aria-label; 0 paragraph, listitem, button, link and alert roles; the container text is exactly "2 overdue"', () => {
    const todos = [open('2026-10-31'), open('2026-11-01'), done('2026-10-30'), open(), open('2026-09-15')];

    const { container } = render(<OverdueCount todos={todos} />);

    const matches = elementsWithText(container, '2 overdue');
    expect(matches).toHaveLength(1);
    const [element] = matches;
    expect(element?.tagName).not.toBe('P');
    expect(element).not.toHaveAttribute('aria-label');
    expect(roleCounts(container)).toEqual({ paragraph: 0, listitem: 0, button: 0, link: 0, alert: 0 });
    expect(container.textContent).toBe('2 overdue');
  });

  it('AC-23.4: (a) [], (b) due today, (c) done and due yesterday, (d) open without a date render text ""; (e) open and due 2026-10-31 renders exactly "1 overdue"', () => {
    const cases: Record<string, readonly Entry[]> = {
      a: [],
      b: [open('2026-11-01')],
      c: [done('2026-10-31')],
      d: [open()],
      e: [open('2026-10-31')],
    };
    const texts: Record<string, string | null> = {};

    for (const [name, todos] of Object.entries(cases)) {
      const { container, unmount } = render(<OverdueCount todos={todos} />);
      texts[name] = container.textContent;
      unmount();
    }

    expect(texts).toEqual({ a: '', b: '', c: '', d: '', e: '1 overdue' });
  });

  it('AC-23.5: renderToString gives identical markup on 2026-11-01 and 2030-01-01 with no "overdue"; hydrating it logs 0 errors and 0 warnings on process.stderr.write and then reads "1 overdue"', async () => {
    const element = <OverdueCount todos={[open('2026-10-31')]} />;
    const first = renderToString(element);
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const second = renderToString(element);
    vi.setSystemTime(firstOfNovember());
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = first;
    const stderrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    onTestFinished(() => {
      act(() => root?.unmount());
      host.remove();
    });

    await act(async () => {
      root = hydrateRoot(host, element, { onRecoverableError });
      await Promise.resolve();
    });
    const writes = stderrWrite.mock.calls.length;
    stderrWrite.mockRestore();

    expect(second).toBe(first);
    expect(first).not.toContain('overdue');
    expect(writes).toBe(0);
    expect(onRecoverableError).toHaveBeenCalledTimes(0);
    expect(host.textContent).toBe('1 overdue');
  });

  it('AC-23.6: reads "1 overdue", "", "2 overdue", then "2 overdue" after local midnight with a third todo due 2026-11-01, and leaves 0 timers', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'setInterval'] });
    vi.setSystemTime(firstOfNovember());
    const texts: (string | null)[] = [];
    const { container, rerender } = render(<OverdueCount todos={[open('2026-10-31')]} />);
    texts.push(container.textContent);

    rerender(<OverdueCount todos={[done('2026-10-31')]} />);
    texts.push(container.textContent);
    rerender(<OverdueCount todos={[open('2026-10-31'), open('2026-10-31')]} />);
    texts.push(container.textContent);
    vi.setSystemTime(new Date(2026, 10, 2, 0, 0, 1));
    rerender(<OverdueCount todos={[open('2026-10-31'), open('2026-10-31'), open('2026-11-01')]} />);
    texts.push(container.textContent);

    expect(texts).toEqual(['1 overdue', '', '2 overdue', '2 overdue']);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('<OverdueCount> announced (§33)', () => {
  it('AC-33.1: exactly 1 status element, a SPAN reading "2 overdue" with role="status" and no aria-label, aria-live or aria-atomic; 0 paragraph, listitem, button, link and alert roles; the container text is exactly "2 overdue"', () => {
    const todos = [open('2026-10-31'), open('2026-11-01'), done('2026-10-30'), open(), open('2026-09-15')];

    const { container } = render(<OverdueCount todos={todos} />);

    const statuses = statusesIn(container);
    expect(statuses).toHaveLength(1);
    const [status] = statuses;
    expect(status?.tagName).toBe('SPAN');
    expect(status?.textContent).toBe('2 overdue');
    expect(status).toHaveAttribute('role', 'status');
    expect(status).not.toHaveAttribute('aria-label');
    expect(status).not.toHaveAttribute('aria-live');
    expect(status).not.toHaveAttribute('aria-atomic');
    expect(roleCounts(container)).toEqual({ paragraph: 0, listitem: 0, button: 0, link: 0, alert: 0 });
    expect(container.textContent).toBe('2 overdue');
  });

  it('AC-33.2: (a) [], (b) due today, (c) done and due yesterday, (d) open without a date render exactly 1 status element with text "" and 0 child nodes; (e) open and due 2026-10-31 renders exactly 1 status element reading "1 overdue"', () => {
    const cases: Record<string, readonly Entry[]> = {
      a: [],
      b: [open('2026-11-01')],
      c: [done('2026-10-31')],
      d: [open()],
      e: [open('2026-10-31')],
    };
    const seen: Record<string, StatusSnapshot> = {};

    for (const [name, todos] of Object.entries(cases)) {
      const { container, unmount } = render(<OverdueCount todos={todos} />);
      seen[name] = snapshotStatuses(container);
      unmount();
    }

    const empty: StatusSnapshot = { count: 1, text: '', childNodes: 0 };
    expect(seen).toEqual({ a: empty, b: empty, c: empty, d: empty, e: { count: 1, text: '1 overdue', childNodes: 1 } });
  });

  it('AC-33.3: renderToString gives identical markup on 2026-11-01 and 2030-01-01, equal to <span role="status"></span> with no "overdue"; hydrating it logs 0 errors and 0 warnings on process.stderr.write; the status element after the effects is the same node and reads "1 overdue"', async () => {
    const element = <OverdueCount todos={[open('2026-10-31')]} />;
    const first = renderToString(element);
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const second = renderToString(element);
    vi.setSystemTime(firstOfNovember());
    const host = document.body.appendChild(document.createElement('div'));
    host.innerHTML = first;
    const before = host.querySelector('[role="status"]');
    const stderrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const onRecoverableError = vi.fn();
    let root: Root | undefined;
    onTestFinished(() => {
      act(() => root?.unmount());
      host.remove();
    });

    await act(async () => {
      root = hydrateRoot(host, element, { onRecoverableError });
      await Promise.resolve();
    });
    const writes = stderrWrite.mock.calls.length;
    stderrWrite.mockRestore();

    expect(second).toBe(first);
    expect(first).toBe('<span role="status"></span>');
    expect(first).not.toContain('overdue');
    expect(writes).toBe(0);
    expect(onRecoverableError).toHaveBeenCalledTimes(0);
    const after = statusesIn(host);
    expect(after).toHaveLength(1);
    expect(before).not.toBeNull();
    expect(after[0]).toBe(before);
    expect(after[0]?.textContent).toBe('1 overdue');
  });

  it('AC-33.4: reads "1 overdue", "", "2 overdue" in the same status node, still in the document and the only one after each step, and leaves 0 timers', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'setInterval'] });
    vi.setSystemTime(firstOfNovember());
    const { container, rerender } = render(<OverdueCount todos={[open('2026-10-31')]} />);
    const initial = statusesIn(container);
    expect(initial).toHaveLength(1);
    const kept = initial[0];
    const steps: { text: string | null | undefined; count: number; same: boolean; connected: boolean }[] = [];
    const record = (): void => {
      const now = statusesIn(container);
      steps.push({
        text: kept?.textContent,
        count: now.length,
        same: now[0] === kept,
        connected: kept?.isConnected === true,
      });
    };
    record();

    rerender(<OverdueCount todos={[done('2026-10-31')]} />);
    record();
    rerender(<OverdueCount todos={[open('2026-10-31'), open('2026-10-31')]} />);
    record();

    expect(steps).toEqual([
      { text: '1 overdue', count: 1, same: true, connected: true },
      { text: '', count: 1, same: true, connected: true },
      { text: '2 overdue', count: 1, same: true, connected: true },
    ]);
    expect(vi.getTimerCount()).toBe(0);
  });
});
