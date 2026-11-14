import { expect, test, type Locator, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL from .env via playwright.config.ts).
const prisma = new PrismaClient();

test.beforeEach(async () => {
  await prisma.todo.deleteMany();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

// Rows are given in display order: the list is `createdAt desc` (§5 REQ-5.1), so index 0 gets the newest createdAt.
// No due date is seeded, so a row's text is its title alone.
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// AC-38.5's store: D "Buy milk" (open), C "Milkshake" (done), B "Call mom" (open), A "Walk the dog" (done).
async function seedFourTodos(): Promise<void> {
  await seedInDisplayOrder([
    { title: 'Buy milk' },
    { title: 'Milkshake', completed: true },
    { title: 'Call mom' },
    { title: 'Walk the dog', completed: true },
  ]);
}

async function storedTodos(): Promise<{ titles: string[]; completed: boolean[] }> {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
    select: { title: true, completed: true },
  });
  return { titles: todos.map((todo) => todo.title), completed: todos.map((todo) => todo.completed) };
}

function rows(page: Page): Locator {
  return page.getByRole('listitem');
}

// The §13 remaining count, whatever its number (the pattern e2e §23 and §33 use).
function remainingCount(page: Page): Locator {
  return page.getByText(/^\d+ items? left$/);
}

// §32 and §36 append "(n)" to both labels, so the name is matched with or without it.
function completeAllButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Mark all complete( \(\d+\))?$/ });
}

function clearCompletedButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Clear completed( \(\d+\))?$/ });
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// §38 search match count (B7.4).
test.describe('§38 search match count', () => {
  test('AC-38.7: opening /?q=milk and /?q=zzz leaves the stored titles and completed flags equal to the snapshot, "Mark all complete" and "Clear completed" enabled, and the "N items left" text unchanged between the two addresses', async ({
    page,
  }) => {
    await seedFourTodos();
    const snapshot = await storedTodos();

    await openHydrated(page, '/?q=milk');

    await expect(rows(page)).toHaveText(['Buy milk', 'Milkshake']);
    await expect(remainingCount(page)).toHaveCount(1);
    const remainingOnMilk = await remainingCount(page).textContent();
    await expect(completeAllButton(page)).toHaveCount(1);
    await expect(completeAllButton(page)).toBeEnabled();
    await expect(clearCompletedButton(page)).toHaveCount(1);
    await expect(clearCompletedButton(page)).toBeEnabled();

    await openHydrated(page, '/?q=zzz');

    await expect(rows(page)).toHaveCount(0);
    await expect(remainingCount(page)).toHaveCount(1);
    const remainingOnZzz = await remainingCount(page).textContent();
    await expect(completeAllButton(page)).toHaveCount(1);
    await expect(completeAllButton(page)).toBeEnabled();
    await expect(clearCompletedButton(page)).toHaveCount(1);
    await expect(clearCompletedButton(page)).toBeEnabled();
    expect(remainingOnMilk).toBe('2 items left');
    expect(remainingOnZzz).toBe(remainingOnMilk);
    expect(await storedTodos()).toEqual(snapshot);
  });
});
