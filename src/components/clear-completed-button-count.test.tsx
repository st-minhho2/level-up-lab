import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClearCompletedButton } from './clear-completed-button';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
  clearCompletedTodosAction: vi.fn(),
  setTodoDueDateAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('<ClearCompletedButton> count (§32)', () => {
  it('AC-32.3: renders 1 button named exactly "Clear completed" each time, disabled with completedCount 0 and enabled with no completedCount', () => {
    const first = render(<ClearCompletedButton disabled={true} completedCount={0} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled();

    first.unmount();
    render(<ClearCompletedButton disabled={false} />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeEnabled();
  });
});
