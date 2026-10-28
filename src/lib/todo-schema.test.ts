import { describe, expect, it } from 'vitest';
import { createTodoSchema } from './todo-schema';

function firstMessage(result: ReturnType<typeof createTodoSchema.safeParse>): string | undefined {
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('createTodoSchema', () => {
  it('AC-2: trims the title and keeps 1..200 characters', () => {
    const padded = createTodoSchema.safeParse({ title: '  Buy milk  ' });
    const longest = createTodoSchema.safeParse({ title: 'x'.repeat(200) });

    expect(padded.success && padded.data.title).toBe('Buy milk');
    expect(longest.success).toBe(true);
  });

  it('AC-3: rejects a whitespace-only title with "Title is required"', () => {
    const result = createTodoSchema.safeParse({ title: '   ' });

    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe('Title is required');
  });

  it('AC-3: rejects a 201-character title with "Title must be 200 characters or fewer"', () => {
    const result = createTodoSchema.safeParse({ title: 'x'.repeat(201) });

    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe('Title must be 200 characters or fewer');
  });
});
