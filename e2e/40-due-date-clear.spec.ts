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

// Opens `/` and waits for the client to hydrate, so "Clear due date" reaches React's handler and the save is a Server
// Action POST, not a native form submission.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

async function reloadHydrated(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// The row is addressed by position because its controls change while it is being edited.
function rowB(page: Page): Locator {
  return page.getByRole('listitem').nth(1);
}

// "B's row shows no `Due` text, no `Overdue` and no `Due today`, and has 1 button "Edit due date"; the list reads
// [C, B, A] and B is still unchecked; A's and C's rows are unchanged" (each row's text is exactly its title).
async function expectBCleared(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
  await expect(rowB(page).getByText('Due', { exact: false })).toHaveCount(0);
  await expect(rowB(page).getByText('Overdue', { exact: true })).toHaveCount(0);
  await expect(rowB(page).getByText('Due today', { exact: true })).toHaveCount(0);
  await expect(rowB(page).getByRole('button', { name: 'Edit due date' })).toHaveCount(1);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).not.toBeChecked();
}

test.describe('§40 a "Clear due date" button removes the due date in one step', () => {
  test('AC-40.6: clicking "Clear due date" on B leaves 0 "Due date" fields; before and after a reload B shows no Due, Overdue or Due today text, 1 "Edit due date", the list reads [C, B, A], B unchecked, A and C unchanged', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', dueDate: '2026-11-05' }, { title: 'A' }]);
    await openHydrated(page);
    await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B\s*Due 2026-11-05/, 'A']);
    const rowA = page.getByRole('listitem').nth(2);
    const rowC = page.getByRole('listitem').nth(0);
    const rowAHtmlBefore = await rowA.innerHTML();
    const rowCHtmlBefore = await rowC.innerHTML();

    await rowB(page).getByRole('button', { name: 'Edit due date' }).click();
    await rowB(page).getByRole('button', { name: 'Clear due date', exact: true }).click();

    await expect(page.getByLabel('Due date', { exact: true })).toHaveCount(0);
    await expectBCleared(page);
    expect(await rowA.innerHTML()).toBe(rowAHtmlBefore);
    expect(await rowC.innerHTML()).toBe(rowCHtmlBefore);

    await reloadHydrated(page);

    await expectBCleared(page);
    expect(await rowA.innerHTML()).toBe(rowAHtmlBefore);
    expect(await rowC.innerHTML()).toBe(rowCHtmlBefore);
  });
});
