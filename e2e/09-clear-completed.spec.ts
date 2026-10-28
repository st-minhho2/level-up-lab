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

function clearButton(page: Page) {
  return page.getByRole('button', { name: 'Clear completed' });
}

// §9 clear completed (B1.3).
test.describe('§9 clear completed todos', () => {
  test('AC-9.2: the button is disabled on an empty list and on an open-only list', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('No todos yet')).toBeVisible();
    await expect(clearButton(page)).toHaveCount(1);
    await expect(clearButton(page)).toBeDisabled();

    await seedInDisplayOrder([{ title: 'B' }, { title: 'A' }]);
    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['B', 'A']);
    await expect(clearButton(page)).toHaveCount(1);
    await expect(clearButton(page)).toBeDisabled();
  });

  test('AC-9.2: the button is enabled once a todo is completed', async ({ page }) => {
    await seedInDisplayOrder([{ title: 'B', completed: true }, { title: 'A' }]);
    await page.goto('/');

    await expect(page.getByRole('listitem')).toHaveText(['B', 'A']);
    await expect(clearButton(page)).toHaveCount(1);
    await expect(clearButton(page)).toBeEnabled();
  });

  test('AC-9.3: clicking removes the completed todos and the rest keep their order after a reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await page.goto('/');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    await expect(clearButton(page)).toBeEnabled();

    await clearButton(page).click();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
    await expect(page.getByRole('checkbox', { name: 'C', exact: true })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'A', exact: true })).not.toBeChecked();
    await expect(clearButton(page)).toBeDisabled();

    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
    await expect(page.getByRole('checkbox', { name: 'C', exact: true })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'A', exact: true })).not.toBeChecked();
    await expect(clearButton(page)).toBeDisabled();
    expect(
      await prisma.todo.findMany({ orderBy: { createdAt: 'desc' }, select: { title: true, completed: true } }),
    ).toEqual([
      { title: 'C', completed: false },
      { title: 'A', completed: false },
    ]);
  });
});
