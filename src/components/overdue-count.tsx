'use client';
// §23 OverdueCount: the overdue number, read against the browser's local day after hydration (REQ-23.5).
import { useEffect, useState, type ReactNode } from 'react';
import { countOverdue, overdueLabel } from '@/lib/overdue-count';
import { todayOf } from '@/lib/todo-overdue';

export function OverdueCount({
  todos,
}: {
  readonly todos: readonly { readonly completed: boolean; readonly dueDate?: string }[];
}): ReactNode {
  // Undefined on the server and in the first client render, so both render nothing (REQ-23.5).
  const [today, setToday] = useState<string | undefined>(undefined);

  // The day is read once per mount and kept across midnight; a reload reads the new day, no timer does (REQ-23.6).
  useEffect(() => {
    setToday((previous) => previous ?? todayOf(new Date()));
  }, []);

  const label = today === undefined ? undefined : overdueLabel(countOverdue(todos, today));
  return label === undefined ? undefined : <span>{label}</span>;
}
