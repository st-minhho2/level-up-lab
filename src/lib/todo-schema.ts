// §5 title rules; §6 reuses them.
import { z } from 'zod';

// Limits from §5 REQ-5.2 / REQ-5.3: trimmed, 1..200 characters.
export const TITLE_MAX_LENGTH = 200;

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(TITLE_MAX_LENGTH, 'Title must be 200 characters or fewer'),
});

export const toggleTodoSchema = z.object({
  id: z.string().min(1, 'Todo id is required'),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type ToggleTodoInput = z.infer<typeof toggleTodoSchema>;
