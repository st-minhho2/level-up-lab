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
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action, not a lost event.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// The <li> whose checkbox is named exactly `title` (§5: the title is the checkbox's accessible name).
function rowOf(page: Page, title: string): Locator {
  return page.getByRole('listitem').filter({ has: page.getByRole('checkbox', { name: title, exact: true }) });
}

function deleteButtonOf(page: Page, title: string): Locator {
  return rowOf(page, title).getByRole('button', { name: 'Delete todo', exact: true });
}

// REQ-19.3: each row holds exactly 1 button named "Delete todo" before its click.
async function clickDelete(page: Page, title: string): Promise<void> {
  await expect(deleteButtonOf(page, title)).toHaveCount(1);
  await deleteButtonOf(page, title).click();
}

// "The list reads [C, A] (2 rows, B absent), C's and A's checkboxes unchecked".
async function expectCAOnly(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'C', exact: true })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'A', exact: true })).not.toBeChecked();
}

// "0 rows and the text "No todos yet" is visible".
async function expectEmpty(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('No todos yet')).toBeVisible();
}

// §19 delete a todo (B3.3).
test.describe('§19 delete a todo', () => {
  test('AC-19.7: C (open), B (done), A (open): deleting B leaves [C, A] unchecked before and after a reload; deleting C and A leaves 0 rows and "No todos yet" before and after a reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page, '/');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);

    await clickDelete(page, 'B');

    await expectCAOnly(page);

    await page.reload();

    await expectCAOnly(page);

    await page.waitForLoadState('networkidle');
    await clickDelete(page, 'C');
    await expect(page.getByRole('listitem')).toHaveText(['A']);
    await clickDelete(page, 'A');

    await expectEmpty(page);

    await page.reload();

    await expectEmpty(page);
  });
});
