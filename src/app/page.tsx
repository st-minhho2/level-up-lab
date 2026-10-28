import type { ReactNode } from 'react';

// Server Component. Replaced by the first feature slice (specs/FEAT-001-todo-list.md).
export default function HomePage(): ReactNode {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">level-up-lab</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Spec-driven + TDD lab. Every feature starts in <code>specs/</code>.
      </p>
    </main>
  );
}
