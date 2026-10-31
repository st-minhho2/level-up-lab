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

function markAllButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Mark all complete' });
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// "The list reads [C, B, A] (3 rows, same order), all 3 checkboxes checked, and the button is disabled".
async function expectAllCompleteInOrder(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await expect(page.getByRole('checkbox', { name: 'C', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'A', exact: true })).toBeChecked();
  await expect(markAllButton(page)).toHaveCount(1);
  await expect(markAllButton(page)).toBeDisabled();
}

// §14 mark all complete (B2.3).
test.describe('§14 mark all complete', () => {
  test('AC-14.6: with no stored todo, / shows exactly 1 button "Mark all complete", disabled', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(markAllButton(page)).toHaveCount(1);
    await expect(markAllButton(page)).toBeDisabled();
  });

  test('AC-14.6: C (open), B (done), A (open): the button is enabled, and after the click and after a reload the list reads [C, B, A], all 3 checked, the button disabled', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page, '/');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    await expect(markAllButton(page)).toHaveCount(1);
    await expect(markAllButton(page)).toBeEnabled();

    await markAllButton(page).click();

    await expectAllCompleteInOrder(page);

    await page.reload();

    await expectAllCompleteInOrder(page);
  });

  test('on /?filter=completed with one open and one completed todo stored, exactly 1 button "Mark all complete" is enabled (REQ-14.4)', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'B' }, { title: 'A', completed: true }]);

    await page.goto('/?filter=completed');

    await expect(page.getByRole('listitem')).toHaveText(['A']);
    await expect(markAllButton(page)).toHaveCount(1);
    await expect(markAllButton(page)).toBeEnabled();
  });
});
