// §7 home page; §12 the list filtered by the `filter` query parameter.
import type { ReactNode } from 'react';
import { ClearCompletedButton } from '@/components/clear-completed-button';
import { TodoFilterNav } from '@/components/todo-filter-nav';
import { TodoForm } from '@/components/todo-form';
import { TodoItem } from '@/components/todo-item';
import { emptyListMessage, filterTodos, parseTodoFilter } from '@/lib/todo-filter';
import { listTodos } from '@/lib/todos';

// Server Component: reads straight from src/lib; mutations go through src/actions/todos.ts.
export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}): Promise<ReactNode> {
  const [todos, params] = await Promise.all([listTodos(), searchParams]);
  const filter = parseTodoFilter(params.filter);
  const shown = filterTodos(todos, filter);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Todos</h1>
      <TodoForm />
      {/* §9: outside the list and in both states, so it is never a listitem and never hidden (REQ-9.5). */}
      {/* §12 REQ-12.10: enabled from the stored todos, not the filtered ones. */}
      <ClearCompletedButton disabled={!todos.some((todo) => todo.completed)} />
      <TodoFilterNav selected={filter} />
      {shown.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">{emptyListMessage(filter, todos.length)}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </main>
  );
}
