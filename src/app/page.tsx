import type { ReactNode } from 'react';
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
