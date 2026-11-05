import { expect, test, type Page } from '@playwright/test';
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
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// Opens `/` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST; a click before hydration would itself be a navigation.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// REQ-26.4 "without a full reload": counts every document navigation of the main frame from now on.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

async function addTodo(page: Page, title: string): Promise<void> {
  await page.getByRole('textbox', { name: 'New todo' }).fill(title);
  await page.getByRole('button', { name: 'Add' }).click();
}

// §26 the browser tab title shows the remaining count (B5.4).
test.describe('§26 page title', () => {
  test('AC-26.4: on /?filter=completed the title is "(2) Todos" with exactly one "2 items left", and on /?q=zzz still "(2) Todos"', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);

    await page.goto('/?filter=completed');

    await expect(page).toHaveTitle('(2) Todos');
    await expect(page.getByText('2 items left', { exact: true })).toHaveCount(1);

    await page.goto('/?q=zzz');

    await expect(page).toHaveTitle('(2) Todos');
  });

  test('AC-26.5: the title reads "Todos", then "(1) Todos" after A, "(2) Todos" after B, "(1) Todos" after checking A, with no navigation', async ({
    page,
  }) => {
    await openHydrated(page);
    const address = page.url();
    const navigations = watchNavigations(page);
    await expect(page).toHaveTitle('Todos');

    await addTodo(page, 'A');

    await expect(page.getByRole('listitem')).toHaveText(['A']);
    await expect(page).toHaveTitle('(1) Todos');

    await addTodo(page, 'B');

    await expect(page.getByRole('listitem')).toHaveText(['B', 'A']);
    await expect(page).toHaveTitle('(2) Todos');

    const boxA = page.getByRole('checkbox', { name: 'A', exact: true });
    await boxA.click();

    await expect(boxA).toBeChecked();
    await expect(page).toHaveTitle('(1) Todos');
    expect(navigations()).toBe(0);
    expect(page.url()).toBe(address);
  });

  test('AC-26.6: the title reads "(2) Todos" before "Clear completed", after it and after a reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page);
    await expect(page).toHaveTitle('(2) Todos');

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
    await expect(page).toHaveTitle('(2) Todos');

    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
    await expect(page).toHaveTitle('(2) Todos');
  });

  test('AC-26.7: with every todo done the title is "Todos" on load and after a reload, and /api/health still answers', async ({
    page,
    request,
  }) => {
    await seedInDisplayOrder([
      { title: 'B', completed: true },
      { title: 'A', completed: true },
    ]);

    await page.goto('/');

    await expect(page).toHaveTitle('Todos');

    await page.reload();

    await expect(page).toHaveTitle('Todos');

    const health = await request.get('/api/health');

    expect(health.status()).toBe(200);
  });
});
