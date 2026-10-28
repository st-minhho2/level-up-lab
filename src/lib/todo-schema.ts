import { z } from 'zod';

// Skeleton: shapes only. Limits and messages come from specs/FEAT-001-todo-list.md REQ-2/REQ-3 in the green commit.
export const createTodoSchema = z.object({
  title: z.string(),
});

export const toggleTodoSchema = z.object({
  id: z.string(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type ToggleTodoInput = z.infer<typeof toggleTodoSchema>;
