import { PrismaClient } from '@prisma/client';

// Idempotent sample data for `pnpm db:seed`. Fixed ids are fine here (never in tests).
const prisma = new PrismaClient();

const todos = [
  { id: 'seed-todo-1', title: 'Read specs/TEMPLATE.md', completed: true },
  { id: 'seed-todo-2', title: 'Write the red tests first', completed: false },
  { id: 'seed-todo-3', title: 'Keep mutation score above 70%', completed: false },
];

async function main(): Promise<void> {
  for (const todo of todos) {
    await prisma.todo.upsert({ where: { id: todo.id }, update: todo, create: todo });
  }
  console.log(`[seed] ${todos.length} todos upserted`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
