'use client';

import type { ReactNode } from 'react';
import type { Todo } from '@/lib/todos';

// Skeleton shell; filled in the green commit.
export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode {
  return <li data-id={todo.id} />;
}
