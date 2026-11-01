'use client';

// §19 DeleteTodoButton; §10 the message of a failed delete, directly after the button inside the row. Skeleton: the
// body is written by the green commit.
import type { ReactNode } from 'react';
import { NotImplementedError } from '@/lib/errors';

export function DeleteTodoButton({ todoId }: { readonly todoId: string }): ReactNode {
  throw new NotImplementedError(`DeleteTodoButton(${todoId})`);
}
