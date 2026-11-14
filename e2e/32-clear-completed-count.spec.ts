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

// The button found by its exact accessible name, so "Clear completed" does not match "Clear completed (2)".
function clearButton(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true });
}

// §32 clear-completed count (B6.4).
test.describe('§32 clear-completed count', () => {
  test('AC-32.7: with no stored todo 1 button is named exactly "Clear completed", disabled, with "No todos yet" shown', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();
    await expect(clearButton(page, 'Clear completed')).toHaveCount(1);
    await expect(clearButton(page, 'Clear completed')).toBeDisabled();
  });
});
