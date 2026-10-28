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

// The row is addressed by position because its text and controls change while it is being edited.
async function retitle(page: Page, index: number, draft: string): Promise<void> {
  const row = page.getByRole('listitem').nth(index);
  await row.getByRole('button', { name: 'Edit title' }).click();
  await row.getByRole('textbox', { name: 'Edit title' }).fill(draft);
  await row.getByRole('button', { name: 'Save' }).click();
}

test.describe('§6 edit a todo title', () => {
  test('AC-6.1: activating edit shows the title in a text field named "Edit title"', async ({ page }) => {
    await seedInDisplayOrder([{ title: 'Buy mik' }]);
    await page.goto('/');

    await page.getByRole('button', { name: 'Edit title' }).click();

    const field = page.getByRole('textbox', { name: 'Edit title' });
    await expect(field).toHaveCount(1);
    await expect(field).toHaveValue('Buy mik');
  });

  test('AC-6.2: a saved title survives a reload', async ({ page }) => {
    await seedInDisplayOrder([{ title: 'Buy mik' }]);
    await page.goto('/');

    await retitle(page, 0, '  Buy milk  ');

    await expect(page.getByRole('checkbox', { name: 'Buy milk', exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Buy milk', exact: true })).toBeVisible();
    expect(await prisma.todo.findMany({ select: { title: true } })).toEqual([{ title: 'Buy milk' }]);
  });

  test('AC-6.3: an edited todo keeps its position and completion state', async ({ page }) => {
    await seedInDisplayOrder([{ title: 'A' }, { title: 'B', completed: true }, { title: 'C' }]);
    await page.goto('/');
    await expect(page.getByRole('listitem')).toHaveText(['A', 'B', 'C']);

    await retitle(page, 1, 'B2');
    await expect(page.getByRole('listitem')).toHaveText(['A', 'B2', 'C']);
    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['A', 'B2', 'C']);
    await expect(page.getByRole('checkbox', { name: 'B2', exact: true })).toBeChecked();
  });

  test('AC-6.7: a duplicate title is accepted', async ({ page }) => {
    await seedInDisplayOrder([{ title: 'A' }, { title: 'B' }]);
    await page.goto('/');

    await retitle(page, 1, 'A');

    await expect(page.getByRole('checkbox', { name: 'A', exact: true })).toHaveCount(2);
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'A', exact: true })).toHaveCount(2);
    expect(await prisma.todo.count({ where: { title: 'A' } })).toBe(2);
  });
});
