// §7 home page.
import type { ReactNode } from 'react';
import { ClearCompletedButton } from '@/components/clear-completed-button';
import { TodoForm } from '@/components/todo-form';
import { TodoItem } from '@/components/todo-item';
import { listTodos } from '@/lib/todos';

// Server Component: reads straight from src/lib; mutations go through src/actions/todos.ts.
export const dynamic = 'force-dynamic';

export default async function HomePage(): Promise<ReactNode> {
  const todos = await listTodos();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Todos</h1>
      <TodoForm />
      {/* §9: outside the list and in both states, so it is never a listitem and never hidden (REQ-9.5). */}
      <ClearCompletedButton disabled={!todos.some((todo) => todo.completed)} />
      {todos.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No todos yet</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </main>
  );
}
