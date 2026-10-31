'use client';

// §15 TodoDueDate: a todo's due-date text and its edit control, rendered inside the TodoItem row.
import type { ReactNode } from 'react';

// Skeleton (B2.4): renders nothing until the green step.
export function TodoDueDate({
  todoId,
  dueDate,
}: {
  readonly todoId: string;
  readonly dueDate: string | undefined;
}): ReactNode {
  // Read so the stub keeps §15's props; the green step renders them.
  void [todoId, dueDate];
  return null;
}
