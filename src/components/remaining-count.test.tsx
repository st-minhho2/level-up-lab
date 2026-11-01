import { render, screen } from '@testing-library/react';
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
