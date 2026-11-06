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
  rows: readonly { readonly title: string; readonly completed?: boolean; readonly dueDate?: string }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: {
        title: row.title,
        completed: row.completed,
        createdAt: new Date(2026, 0, rows.length - index),
        dueDate: row.dueDate === undefined ? undefined : new Date(`${row.dueDate}T00:00:00.000Z`),
      },
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

// The row is addressed by position because its controls change while it is being edited.
function rowB(page: Page): Locator {
  return page.getByRole('listitem').nth(1);
}

// "the list reads [C, B, A], B's row reads `Due 2026-11-05` and B is still checked".
async function expectBDueInOrder(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B\s*Due 2026-11-05\s*$/, 'A']);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
}

test.describe('§28 Escape closes the due-date editor without saving', () => {
  test('AC-28.7: 0 "Due date" fields after the Escape; B\'s row reads Due 2026-11-05 before and after the reload; 0 POST requests to / between the Escape and the reload; the list reads [C, B, A] and B is still checked', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true, dueDate: '2026-11-05' }, { title: 'A' }]);
    await openHydrated(page);
    await expectBDueInOrder(page);
    await rowB(page).getByRole('button', { name: 'Edit due date' }).click();
    const field = rowB(page).getByLabel('Due date', { exact: true });
    await field.fill('2026-12-01');
    const posts = recordPostsToRoot(page);

    await field.press('Escape');

    await expect(page.getByLabel('Due date', { exact: true })).toHaveCount(0);
    await expectBDueInOrder(page);
    expect(posts).toEqual([]);
    await page.reload();
    await expectBDueInOrder(page);
  });
});
