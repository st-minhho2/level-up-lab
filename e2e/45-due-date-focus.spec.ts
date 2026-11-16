import { expect, test, type Locator, type Page } from '@playwright/test';
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
  rows: readonly { readonly title: string; readonly dueDate?: string }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: {
        title: row.title,
        createdAt: new Date(2026, 0, rows.length - index),
        dueDate: row.dueDate === undefined ? undefined : new Date(`${row.dueDate}T00:00:00.000Z`),
      },
    });
  }
}

// Opens `/` and waits for the client to hydrate, so the click reaches React's handler.
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

// Rows are addressed by position because B's controls change while it is being edited.
function row(page: Page, index: number): Locator {
  return page.getByRole('listitem').nth(index);
}

// Reads, in the page, whether the given element is document.activeElement.
async function isActiveElement(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => document.activeElement === element);
}

test.describe('§45 Opening the due-date editor puts focus in the date field', () => {
  test('AC-45.7: after the click B\'s "Due date" input is the active element with value 2026-11-05 and 0 POSTs, A and C show 0 "Due date" fields; after Escape 0 fields, B reads Due 2026-11-05, still 0 POSTs; after the reload the list reads [C, B, A] and B is unchecked', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', dueDate: '2026-11-05' }, { title: 'A' }]);
    await openHydrated(page);
    await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B\s*Due 2026-11-05/, 'A']);
    const posts = recordPostsToRoot(page);

    await row(page, 1).getByRole('button', { name: 'Edit due date' }).click();

    const field = row(page, 1).getByLabel('Due date', { exact: true });
    await expect(field).toBeVisible();
    expect(await isActiveElement(field)).toBe(true);
    await expect(field).toHaveValue('2026-11-05');
    expect(posts).toEqual([]);
    await expect(row(page, 0).getByLabel('Due date', { exact: true })).toHaveCount(0);
    await expect(row(page, 2).getByLabel('Due date', { exact: true })).toHaveCount(0);

    await page.keyboard.press('Escape');

    await expect(page.getByLabel('Due date', { exact: true })).toHaveCount(0);
    await expect(row(page, 1)).toHaveText(/^\s*B\s*Due 2026-11-05/);
    expect(posts).toEqual([]);

    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B\s*Due 2026-11-05/, 'A']);
    await expect(page.getByRole('checkbox', { name: 'B', exact: true })).not.toBeChecked();
  });
});
