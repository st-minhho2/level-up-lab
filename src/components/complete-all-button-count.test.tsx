import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompleteAllButton } from './complete-all-button';

const actions = vi.hoisted(() => ({
  completeAllTodosAction: vi.fn(),
}));
vi.mock('@/actions/complete-all', () => actions);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<CompleteAllButton> count (§36)', () => {
  it('AC-36.3: renders 1 button named exactly "Mark all complete" each time, disabled with count 0 and enabled with no count', () => {
    const first = render(<CompleteAllButton disabled={true} count={0} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete' })).toBeDisabled();

    first.unmount();
    render(<CompleteAllButton disabled={false} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Mark all complete' })).toBeEnabled();
  });
});
