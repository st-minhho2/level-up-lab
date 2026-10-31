// §16 TodoSearchForm: a native GET form, no state or events, so no 'use client'. Skeleton: the body is written by the
// green commit.
import type { ReactNode } from 'react';
import { NotImplementedError } from '@/lib/errors';
import type { TodoFilter } from '@/lib/todo-filter';

export function TodoSearchForm({ filter, query }: { readonly filter: TodoFilter; readonly query: string }): ReactNode {
  throw new NotImplementedError(`TodoSearchForm(${filter}, ${query})`);
}
