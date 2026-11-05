import { expect, test, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL loaded by playwright.config.ts).
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

// Opens `/` and waits for the client to hydrate, so Escape reaches React's handler and a save would be a Server
// Action POST, not a lost event.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// Collects every POST to `/` (a Server Action call) from the moment it is called; the returned array grows live.
function recordPostsToRoot(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/') {
      posts.push(request.url());
    }
  });
  return posts;
}

test.describe('§24 Escape cancels a title edit', () => {
  test('AC-24.6: 0 textbox roles after the Escape; 0 POST requests to / between the Escape and the reload; after the reload the list reads [C, B, A] and B is still checked', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page);
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    // The row is addressed by position because its text and controls change while it is being edited.
    const row = page.getByRole('listitem').nth(1);
    await row.getByRole('button', { name: 'Edit title' }).click();
    const field = row.getByRole('textbox', { name: 'Edit title' });
    await field.fill('B2');
    const posts = recordPostsToRoot(page);

    await field.press('Escape');

    // The page always holds the "New todo" and search boxes; "0 textbox roles" counts the edit fields.
    await expect(page.getByRole('textbox', { name: 'Edit title' })).toHaveCount(0);
    expect(posts).toEqual([]);
    await page.reload();
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
  });
});
