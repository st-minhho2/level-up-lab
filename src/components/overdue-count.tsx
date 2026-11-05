'use client';
// §23 OverdueCount: the overdue number, read against the browser's local day after hydration (REQ-23.5).
import type { ReactNode } from 'react';

export function OverdueCount({
  todos,
}: {
  readonly todos: readonly { readonly completed: boolean; readonly dueDate?: string }[];
}): ReactNode {
  void todos;
  return undefined;
}
