import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL from .env via playwright.config.ts).
const prisma = new PrismaClient();

test.beforeEach(async () => {
  await prisma.todo.deleteMany();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('§5 todo list', () => {
  test('AC-5.7: an empty list shows "No todos yet" with the New todo box and the Add button', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('No todos yet')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'New todo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('AC-5.1: lists todos newest first', async ({ page }) => {
    for (const [index, title] of ['A', 'B', 'C'].entries()) {
      await prisma.todo.create({ data: { title, createdAt: new Date(2026, 0, 1 + index) } });
    }

    await page.goto('/');

    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
  });

  test('AC-5.6: a created todo survives a reload, and so does its toggled state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('textbox', { name: 'New todo' }).fill('Walk the dog');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).toBeVisible();

    await page.reload();
    const box = page.getByRole('checkbox', { name: 'Walk the dog' });
    await expect(box).toBeVisible();
    await expect(box).not.toBeChecked();

    await box.click();
    await expect(box).toBeChecked();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).toBeChecked();
    expect(await prisma.todo.count({ where: { title: 'Walk the dog', completed: true } })).toBe(1);
  });
});
