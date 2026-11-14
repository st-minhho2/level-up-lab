import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RemainingCount } from './remaining-count';

// RemainingCount is a synchronous Server Component with no state and no events, so it renders directly.
function renderCount(count: number): void {
  render(<RemainingCount count={count} />);
}

describe('<RemainingCount> (§13)', () => {
  it('AC-13.2: renders one paragraph reading "0 items left" for a count of 0', () => {
    const count = 0;

    renderCount(count);

    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent(/^0 items left$/);
  });

  it('AC-13.2: renders one paragraph reading "1 item left" for a count of 1', () => {
    const count = 1;

    renderCount(count);

    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent(/^1 item left$/);
  });

  it('AC-13.2: renders one paragraph reading "2 items left" for a count of 2', () => {
    const count = 2;

    renderCount(count);

    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent(/^2 items left$/);
  });
});

describe('<RemainingCount> (§22)', () => {
  it('AC-22.2: renders one paragraph reading "0 items left" and exactly one "All done" that is not a paragraph, list item, button, link or alert for a count of 0', () => {
    const count = 0;

    renderCount(count);

    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent(/^0 items left$/);
    const allDone = screen.queryAllByText('All done');
    expect(allDone).toHaveLength(1);
    expect(allDone[0]?.tagName).not.toBe('P');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('AC-22.3: renders exactly one paragraph reading "1 item left", "2 items left", "11 items left" and no "All done" for counts 1, 2, 11', () => {
    const cases = [
      { count: 1, label: '1 item left' },
      { count: 2, label: '2 items left' },
      { count: 11, label: '11 items left' },
    ] as const;

    const renders = cases.map(({ count }) => {
      const { unmount } = render(<RemainingCount count={count} />);
      const paragraphs = screen.getAllByRole('paragraph').map((paragraph) => paragraph.textContent);
      const allDone = screen.queryAllByText('All done').length;
      unmount();
      return { paragraphs, allDone };
    });

    expect(renders).toEqual(cases.map(({ label }) => ({ paragraphs: [label], allDone: 0 })));
  });
});

// The text of the one `status` element: its paragraphs and how many "All done" it holds, read with `within`.
function readStatus(status: HTMLElement): { paragraphs: (string | null)[]; allDone: number } {
  return {
    paragraphs: within(status)
      .queryAllByRole('paragraph')
      .map((paragraph) => paragraph.textContent),
    allDone: within(status).queryAllByText('All done', { exact: true }).length,
  };
}

describe('<RemainingCount> (§34)', () => {
  it('AC-34.1: renders exactly 1 status containing the paragraph "0 items left" and exactly 1 "All done", with 0 aria-live="assertive" and 0 alert roles, for a count of 0', () => {
    const count = 0;

    renderCount(count);

    const statuses = screen.queryAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses.map((status) => readStatus(status))).toEqual([{ paragraphs: ['0 items left'], allDone: 1 }]);
    expect(document.querySelectorAll('[aria-live="assertive"]')).toHaveLength(0);
    expect(screen.queryAllByRole('alert')).toHaveLength(0);
  });

  it('AC-34.2: each render of counts 1, 2, 11 has exactly 1 status containing exactly 1 paragraph reading "1 item left", "2 items left", "11 items left", 0 "All done" and 0 alert roles', () => {
    const cases = [
      { count: 1, label: '1 item left' },
      { count: 2, label: '2 items left' },
      { count: 11, label: '11 items left' },
    ] as const;

    const renders = cases.map(({ count }) => {
      const { unmount } = render(<RemainingCount count={count} />);
      const statuses = screen.queryAllByRole('status');
      const inside = statuses.map((status) => readStatus(status));
      const allDone = screen.queryAllByText('All done', { exact: true }).length;
      const alerts = screen.queryAllByRole('alert').length;
      unmount();
      return { inside, allDone, alerts };
    });

    expect(renders).toEqual(
      cases.map(({ label }) => ({ inside: [{ paragraphs: [label], allDone: 0 }], allDone: 0, alerts: 0 })),
    );
  });

  it('AC-34.3: re-rendered from count 1 to 0 then 2, the status found is the held node, reading "0 items left" with "All done", then "2 items left" without "All done"', () => {
    const { rerender } = render(<RemainingCount count={1} />);
    expect(screen.queryAllByRole('status')).toHaveLength(1);
    const held = screen.getByRole('status');

    rerender(<RemainingCount count={0} />);

    const afterZero = screen.getByRole('status');
    expect(afterZero).toBe(held);
    expect(readStatus(afterZero)).toEqual({ paragraphs: ['0 items left'], allDone: 1 });

    rerender(<RemainingCount count={2} />);

    const afterTwo = screen.getByRole('status');
    expect(afterTwo).toBe(held);
    expect(readStatus(afterTwo)).toEqual({ paragraphs: ['2 items left'], allDone: 0 });
  });
});
