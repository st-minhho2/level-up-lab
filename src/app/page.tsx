import type { ReactNode } from 'react';

// Server Component. Skeleton: the list and form arrive in the green commit of FEAT-001.
export default function HomePage(): ReactNode {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Todos</h1>
    </main>
  );
}
