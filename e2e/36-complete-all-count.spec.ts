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

// The button found by its exact accessible name, so "Mark all complete" does not match "Mark all complete (2)".
function completeAllButton(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true });
}

// §36 complete-all count (B7.2).
test.describe('§36 complete-all count', () => {
  test('AC-36.7: with no stored todo 1 button is named exactly "Mark all complete", disabled, with "No todos yet" shown', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();
    await expect(completeAllButton(page, 'Mark all complete')).toHaveCount(1);
    await expect(completeAllButton(page, 'Mark all complete')).toBeDisabled();
  });
});
