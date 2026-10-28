'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { toggleTodoAction } from '@/actions/todos';
import type { Todo } from '@/lib/todos';

export function TodoItem({ todo }: { readonly todo: Todo }): ReactNode {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const inputId = `todo-${todo.id}`;

  function onToggle(): void {
    startTransition(async () => {
      const result = await toggleTodoAction(todo.id);
      setError(result.ok ? undefined : (result.fieldErrors.id?.[0] ?? 'Could not update the todo'));
    });
  }

  return (
    <li className="flex items-center gap-3 rounded border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <input id={inputId} type="checkbox" checked={todo.completed} onChange={onToggle} disabled={pending} />
      <label htmlFor={inputId} className={todo.completed ? 'text-zinc-500 line-through' : ''}>
        {todo.title}
      </label>
      {error !== undefined && (
        <span role="alert" className="ml-auto text-sm text-red-600">
          {error}
        </span>
      )}
    </li>
  );
}
