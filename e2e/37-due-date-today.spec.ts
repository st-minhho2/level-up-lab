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
// A due day is stored as the DATE column §15 writes (`YYYY-MM-DDT00:00:00.000Z`).
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

// The browser's own local calendar day (§17 REQ-17.1, as in AC-17.7), read from `new Date()` local fields in the page,
// never from the test runner's clock or a literal.
async function browserToday(page: Page): Promise<string> {
  return page.evaluate(() => {
    const now = new Date();
    const pad = (value: number): string => String(value).padStart(2, '0');
    return `${String(now.getFullYear()).padStart(4, '0')}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  });
}

// Opens `/` and waits for the client to hydrate, so "Today" and Escape reach React's handlers and a save is a Server
// Action POST, not a native form submission.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

async function reloadHydrated(page: Page): Promise<void> {
  await page.reload();
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

// "the list order is unchanged": [C, B, A], each row's text starting with its title.
async function expectOrder(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect
    .poll(async () => (await page.getByRole('listitem').allTextContents()).map((text) => text.trim().charAt(0)))
    .toEqual(['C', 'B', 'A']);
}

// "B's row reads `Due <today>` and, B being open, exactly 1 element with the text `Due today` in it".
async function expectBDueToday(page: Page, today: string): Promise<void> {
  await expect(rowB(page).getByText(`Due ${today}`, { exact: true })).toBeVisible();
  await expect(rowB(page).getByText('Due today', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Due today', { exact: true })).toHaveCount(1);
  await expectOrder(page);
}

test.describe('§37 a "Today" button fills the due-date field', () => {
  test('AC-37.6: "Today" fills the field with the browser\'s day and makes 0 POSTs; Escape on it leaves 0 "Due date" fields, B reads Due 2026-11-05 and still 0 POSTs; "Today" then "Update due date" makes B read Due <today> with exactly 1 "Due today", the same after a reload; the list order is unchanged', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', dueDate: '2026-11-05' }, { title: 'A' }]);
    await openHydrated(page);
    const today = await browserToday(page);
    await expectOrder(page);
    const posts = recordPostsToRoot(page);

    await rowB(page).getByRole('button', { name: 'Edit due date' }).click();
    await rowB(page).getByRole('button', { name: 'Today', exact: true }).click();

    await expect(rowB(page).getByLabel('Due date', { exact: true })).toHaveValue(today);
    expect(posts).toEqual([]);

    const todayButton = rowB(page).getByRole('button', { name: 'Today', exact: true });
    await todayButton.focus();
    await todayButton.press('Escape');

    await expect(page.getByLabel('Due date', { exact: true })).toHaveCount(0);
    await expect(rowB(page).getByText('Due 2026-11-05', { exact: true })).toBeVisible();
    expect(posts).toEqual([]);
    await expectOrder(page);

    await rowB(page).getByRole('button', { name: 'Edit due date' }).click();
    await rowB(page).getByRole('button', { name: 'Today', exact: true }).click();
    await rowB(page).getByRole('button', { name: 'Update due date' }).click();

    await expect(page.getByLabel('Due date', { exact: true })).toHaveCount(0);
    await expectBDueToday(page, today);

    await reloadHydrated(page);

    await expectBDueToday(page, today);
  });
});
