import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoItem } from './todo-item';

const actions = vi.hoisted(() => ({
  createTodoAction: vi.fn(),
  toggleTodoAction: vi.fn(),
  updateTodoTitleAction: vi.fn(),
}));
vi.mock('@/actions/todos', () => actions);
// §19: TodoItem renders DeleteTodoButton, which imports this module; mocked at the boundary like '@/actions/todos'.
const deleteActions = vi.hoisted(() => ({
  deleteTodoAction: vi.fn(),
}));
vi.mock('@/actions/delete-todo', () => deleteActions);

function todo(completed: boolean) {
  return { id: 'todo-9', title: 'Walk the dog', completed, createdAt: new Date(2026, 0, 1) };
}

function mistyped() {
  return { id: 'todo-9', title: 'Buy mik', completed: false, createdAt: new Date(2026, 0, 1) };
}

// §19 AC-19.5 (b): the open todo "Walk the dog" with id todo-1.
function walkTheDog() {
  return { id: 'todo-1', title: 'Walk the dog', completed: false, createdAt: new Date(2026, 0, 1) };
}

// §10: the one failure result a mutation can report besides its own field errors.
function saveFailed() {
  return { ok: false as const, fieldErrors: { form: ['Could not save, try again'] } };
}

beforeEach(() => {
  vi.resetAllMocks();
});

// §35: removes the window.confirm stub of the tests that click "Delete todo".
afterEach(() => {
  vi.restoreAllMocks();
});

describe('<TodoItem>', () => {
  it('AC-5.1: renders the title as the accessible name of an unchecked checkbox when not completed', () => {
    render(<TodoItem todo={todo(false)} />);

    expect(screen.getByRole('checkbox', { name: 'Walk the dog' })).not.toBeChecked();
  });

  it('AC-5.4: renders a checked checkbox when completed and calls toggleTodoAction with the id on click', async () => {
    actions.toggleTodoAction.mockResolvedValue({ ok: true, data: todo(false) });
    const user = userEvent.setup();
    render(<TodoItem todo={todo(true)} />);

    const box = screen.getByRole('checkbox', { name: 'Walk the dog' });
    expect(box).toBeChecked();
    await user.click(box);

    expect(actions.toggleTodoAction).toHaveBeenCalledWith('todo-9');
  });

  it('AC-5.5: shows "Todo not found" when the action reports the id error', async () => {
    actions.toggleTodoAction.mockResolvedValue({ ok: false, fieldErrors: { id: ['Todo not found'] } });
    const user = userEvent.setup();
    render(<TodoItem todo={todo(false)} />);

    await user.click(screen.getByRole('checkbox', { name: 'Walk the dog' }));

    expect(await screen.findByText('Todo not found')).toBeInTheDocument();
  });
});

describe('<TodoItem> edit mode (§6)', () => {
  it('AC-6.1: shows one text field named "Edit title" with the current title', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    // Idle row text is exactly the title: e2e AC-5.1 compares each <li>'s whole text, so the edit control adds none.
    expect(screen.getByRole('listitem')).toHaveTextContent(/^Buy mik$/);

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy mik');
  });

  it('AC-6.1: keeps the checkbox named by the title while editing', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={todo(true)} />);

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(screen.getByRole('checkbox', { name: 'Walk the dog' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toBeInTheDocument();
  });

  it('AC-6.2: submits the draft to updateTodoTitleAction and leaves edit mode', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: true, data: { ...mistyped(), title: 'Buy milk' } });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, '  Buy milk  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
    expect(actions.updateTodoTitleAction).toHaveBeenCalledWith('todo-9', '  Buy milk  ');
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  });

  it('AC-6.4: keeps the draft and shows the error when the action rejects the title', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(actions.updateTodoTitleAction).toHaveBeenCalledWith('todo-9', '   ');
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('   ');
  });

  it('AC-6.5: shows "Title must be 200 characters or fewer" and keeps the draft when the action rejects the length', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({
      ok: false,
      fieldErrors: { title: ['Title must be 200 characters or fewer'] },
    });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Title must be 200 characters or fewer')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy mik');
  });
});

describe('<TodoItem> when a mutation fails (§10)', () => {
  it('AC-10.2: shows exactly one alert "Could not save, try again" in the row and leaves the checkbox unchecked when the toggle fails, then removes it on the next success', async () => {
    actions.toggleTodoAction.mockResolvedValueOnce(saveFailed()).mockResolvedValueOnce({ ok: true, data: todo(true) });
    const user = userEvent.setup();
    render(<TodoItem todo={todo(false)} />);
    const row = screen.getByRole('listitem');
    const box = screen.getByRole('checkbox', { name: 'Walk the dog' });

    await user.click(box);

    await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(1));
    expect(within(row).getByRole('alert').textContent).toBe('Could not save, try again');
    expect(box).not.toBeChecked();

    // REQ-10.5: the next successful attempt on the same control removes the message.
    await user.click(box);

    expect(actions.toggleTodoAction).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(0));
  });

  it('AC-10.2: shows exactly one alert "Could not save, try again" in the row and keeps the draft "Walk the cat" in edit mode when Save fails, then removes it on the next success', async () => {
    actions.updateTodoTitleAction
      .mockResolvedValueOnce(saveFailed())
      .mockResolvedValueOnce({ ok: true, data: { ...todo(false), title: 'Walk the cat' } });
    const user = userEvent.setup();
    render(<TodoItem todo={todo(false)} />);
    const row = screen.getByRole('listitem');
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, 'Walk the cat');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(1));
    expect(within(row).getByRole('alert').textContent).toBe('Could not save, try again');
    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Walk the cat');

    // REQ-10.5: the next successful attempt on the same control removes the message.
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(within(row).queryAllByRole('alert')).toHaveLength(0));
  });
});

describe('<TodoItem> delete button (§19)', () => {
  it('AC-19.5: (b) holds exactly 1 button "Delete todo" in view mode and exactly 1 in edit mode, adds no text to the row, and a click in view mode calls deleteTodoAction once with ("todo-1")', async () => {
    deleteActions.deleteTodoAction.mockResolvedValue({ ok: true, data: { id: 'todo-1' } });
    // §35: the click in view mode is confirmed.
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<TodoItem todo={walkTheDog()} />);
    const row = screen.getByRole('listitem');
    expect(within(row).getAllByRole('button', { name: 'Delete todo' })).toHaveLength(1);
    // Icon only: the idle row text is still exactly the title (e2e AC-5.1 compares each <li>'s whole text).
    expect(row).toHaveTextContent(/^Walk the dog$/);

    await user.click(within(row).getByRole('button', { name: 'Delete todo' }));

    expect(deleteActions.deleteTodoAction).toHaveBeenCalledTimes(1);
    expect(deleteActions.deleteTodoAction.mock.calls[0]).toEqual(['todo-1']);

    await user.click(within(row).getByRole('button', { name: 'Edit title' }));

    expect(within(row).getByRole('textbox', { name: 'Edit title' })).toBeInTheDocument();
    expect(within(row).getAllByRole('button', { name: 'Delete todo' })).toHaveLength(1);
  });
});

describe('<TodoItem> delete asks for confirmation first (§35)', () => {
  it('AC-35.3: asks 0 confirmations on render and on "Edit title", holds exactly 1 button "Delete todo" in view mode and in edit mode, and adds no text to the row', async () => {
    deleteActions.deleteTodoAction.mockResolvedValue({ ok: true, data: { id: 'todo-1' } });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<TodoItem todo={walkTheDog()} />);
    const row = screen.getByRole('listitem');
    expect(confirm).toHaveBeenCalledTimes(0);
    expect(within(row).getAllByRole('button', { name: 'Delete todo' })).toHaveLength(1);
    expect(row).toHaveTextContent(/^Walk the dog$/);
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);

    await user.click(within(row).getByRole('button', { name: 'Edit title' }));

    expect(confirm).toHaveBeenCalledTimes(0);
    expect(within(row).getByRole('textbox', { name: 'Edit title' })).toBeInTheDocument();
    expect(within(row).getAllByRole('button', { name: 'Delete todo' })).toHaveLength(1);
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);

    await user.click(within(row).getByRole('button', { name: 'Delete todo' }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });
});

// §24: an action promise held open by the test, so a save can be in flight while a key is pressed (AC-24.4).
function deferredSave() {
  let resolve: (value: { ok: true; data: ReturnType<typeof mistyped> }) => void = () => undefined;
  const promise = new Promise<{ ok: true; data: ReturnType<typeof mistyped> }>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

describe('<TodoItem> Escape cancels a title edit (§24)', () => {
  it('AC-24.1: 0 textbox roles; the row\'s label reads "Buy mik"; 1 button named "Edit title"; updateTodoTitleAction called 0 times', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, 'Buy milk');

    await user.keyboard('{Escape}');

    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
    expect(screen.getByRole('listitem')).toHaveTextContent(/^Buy mik$/);
    expect(screen.queryAllByRole('checkbox', { name: 'Buy mik' })).toHaveLength(1);
    expect(screen.queryAllByRole('button', { name: 'Edit title' })).toHaveLength(1);
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(0);
  });

  it('AC-24.2: the field\'s value is "Buy mik" when editing is activated again after the Escape', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, 'Buy milk');
    await user.keyboard('{Escape}');

    await user.click(screen.getByRole('button', { name: 'Edit title' }));

    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy mik');
  });

  it('AC-24.3: 0 alert roles in the row and 0 textbox roles after Escape on a rejected save', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: false, fieldErrors: { title: ['Title is required'] } });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    const row = screen.getByRole('listitem');
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(within(row).getByRole('alert').textContent).toBe('Title is required'));

    await user.type(field, '{Escape}');

    expect(within(row).queryAllByRole('alert')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('AC-24.4: after the Escape the field is still present and holds "Buy milk"; after the resolution 0 textbox roles; updateTodoTitleAction called exactly once', async () => {
    const save = deferredSave();
    actions.updateTodoTitleAction.mockReturnValue(save.promise);
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, 'Buy milk');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);

    await user.type(field, '{Escape}');

    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy milk');

    save.resolve({ ok: true, data: { ...mistyped(), title: 'Buy milk' } });

    await waitFor(() => expect(screen.queryAllByRole('textbox')).toHaveLength(0));
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
  });

  it('AC-24.5: Enter calls updateTodoTitleAction once with ("todo-9", "Buy milk"); ArrowLeft keeps the field present and does not call the action', async () => {
    actions.updateTodoTitleAction.mockResolvedValue({ ok: true, data: { ...mistyped(), title: 'Buy milk' } });
    const user = userEvent.setup();
    render(<TodoItem todo={mistyped()} />);
    await user.click(screen.getByRole('button', { name: 'Edit title' }));
    const field = screen.getByRole('textbox', { name: 'Edit title' });
    await user.clear(field);
    await user.type(field, 'Buy milk');

    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('textbox', { name: 'Edit title' })).toHaveValue('Buy milk');
    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(0);

    await user.keyboard('{Enter}');

    expect(actions.updateTodoTitleAction).toHaveBeenCalledTimes(1);
    expect(actions.updateTodoTitleAction.mock.calls[0]).toEqual(['todo-9', 'Buy milk']);
  });
});
