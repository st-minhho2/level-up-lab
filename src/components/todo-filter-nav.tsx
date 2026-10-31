// §12 TodoFilterNav: links only, no state or events, so no 'use client'. Skeleton: the body is written by the green commit.
import type { ReactNode } from 'react';
import { NotImplementedError } from '@/lib/errors';
import type { TodoFilter } from '@/lib/todo-filter';

export function TodoFilterNav({ selected }: { readonly selected: TodoFilter }): ReactNode {
  throw new NotImplementedError(`TodoFilterNav(${selected})`);
}
