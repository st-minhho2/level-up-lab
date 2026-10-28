import { describe, expect, it } from 'vitest';
import { createTodoSchema, updateTodoTitleSchema } from './todo-schema';

function firstMessage(result: ReturnType<typeof createTodoSchema.safeParse>): string | undefined {
  return result.success ? undefined : result.error.issues[0]?.message;
}

function firstIssue(
  result: ReturnType<typeof updateTodoTitleSchema.safeParse>,
): { path: PropertyKey[]; message: string } | undefined {
  const issue = result.success ? undefined : result.error.issues[0];
  return issue === undefined ? undefined : { path: issue.path, message: issue.message };
}

describe('createTodoSchema', () => {
  it('AC-5.2: trims the title and keeps 1..200 characters', () => {
    const padded = createTodoSchema.safeParse({ title: '  Buy milk  ' });
    const longest = createTodoSchema.safeParse({ title: 'x'.repeat(200) });

    expect(padded.success && padded.data.title).toBe('Buy milk');
    expect(longest.success).toBe(true);
  });

  it('AC-5.3: rejects a whitespace-only title with "Title is required"', () => {
    const result = createTodoSchema.safeParse({ title: '   ' });

    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe('Title is required');
  });

  it('AC-5.3: rejects a 201-character title with "Title must be 200 characters or fewer"', () => {
    const result = createTodoSchema.safeParse({ title: 'x'.repeat(201) });

    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe('Title must be 200 characters or fewer');
  });
});

describe('updateTodoTitleSchema (§6)', () => {
  it('AC-6.2: trims the title', () => {
    const result = updateTodoTitleSchema.safeParse({ id: 'todo-1', title: '  Buy milk  ' });

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({ id: 'todo-1', title: 'Buy milk' });
  });

  it('AC-6.4: rejects an empty title with "Title is required"', () => {
    const blank = updateTodoTitleSchema.safeParse({ id: 'todo-1', title: '   ' });
    const empty = updateTodoTitleSchema.safeParse({ id: 'todo-1', title: '' });

    expect(blank.success).toBe(false);
    expect(firstIssue(blank)).toEqual({ path: ['title'], message: 'Title is required' });
    expect(empty.success).toBe(false);
    expect(firstIssue(empty)).toEqual({ path: ['title'], message: 'Title is required' });
  });

  it('AC-6.5: rejects 201 characters with "Title must be 200 characters or fewer"', () => {
    const result = updateTodoTitleSchema.safeParse({ id: 'todo-1', title: 'x'.repeat(201) });

    expect(result.success).toBe(false);
    expect(firstIssue(result)).toEqual({ path: ['title'], message: 'Title must be 200 characters or fewer' });
  });

  it('AC-6.6: accepts 200 characters padded with spaces', () => {
    const longest = 'x'.repeat(200);

    const result = updateTodoTitleSchema.safeParse({
      id: 'todo-1',
      title: `${' '.repeat(5)}${longest}${' '.repeat(5)}`,
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.title).toBe(longest);
  });
});
