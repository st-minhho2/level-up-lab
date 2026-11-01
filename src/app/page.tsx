// §7 home page; §12 the list filtered by the `filter` query parameter; §13 the remaining count; §14 mark all complete;
// §16 the list searched by title through the `q` query parameter.
import type { ReactNode } from 'react';
import { ClearCompletedButton } from '@/components/clear-completed-button';
import { CompleteAllButton } from '@/components/complete-all-button';
import { RemainingCount } from '@/components/remaining-count';
import { TodoFilterNav } from '@/components/todo-filter-nav';
import { TodoForm } from '@/components/todo-form';
import { TodoItem } from '@/components/todo-item';
import { TodoSearchForm } from '@/components/todo-search-form';
import { countRemaining } from '@/lib/todo-count';
import { filterTodos, parseTodoFilter } from '@/lib/todo-filter';
import { parseSearchQuery, searchEmptyMessage, searchTodos } from '@/lib/todo-search';
import { listTodos } from '@/lib/todos';

// Server Component: reads straight from src/lib; mutations go through src/actions/todos.ts.
export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[]; q?: string | string[] }>;
}): Promise<ReactNode> {
  const [todos, params] = await Promise.all([listTodos(), searchParams]);
  const filter = parseTodoFilter(params.filter);
  const query = parseSearchQuery(params.q);
  // §16 REQ-16.9: the search narrows the filtered list only; the count and both bulk buttons keep using `todos`.
  const shown = searchTodos(filterTodos(todos, filter), query);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Todos</h1>
      <TodoForm />
      {/* §16 REQ-16.1: outside the list and in both states. */}
      <TodoSearchForm filter={filter} query={query} />
      {/* §9: outside the list and in both states, so it is never a listitem and never hidden (REQ-9.5). */}
      {/* §12 REQ-12.10: enabled from the stored todos, not the filtered ones. */}
      <ClearCompletedButton disabled={!todos.some((todo) => todo.completed)} />
      {/* §14 REQ-14.4: enabled from the stored todos, not the filtered ones; outside the list in both states. */}
      <CompleteAllButton disabled={!todos.some((todo) => !todo.completed)} />
      <TodoFilterNav selected={filter} />
      {/* §13 REQ-13.5: counted from the stored todos, not the filtered ones; outside the list in both states. */}
      <RemainingCount count={countRemaining(todos)} />
      {shown.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">{searchEmptyMessage(filter, todos.length, query)}</p>
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
