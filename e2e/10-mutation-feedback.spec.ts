import { expect, test, type Locator, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL from .env via playwright.config.ts).
const prisma = new PrismaClient();

// D-16: the database fault is a trigger this file adds and drops (parameterless DDL, no interpolation). Unqualified
// names land in the worktree schema through Prisma's `?schema=` search path, the same schema the dev server writes to.
async function rejectTodoInserts(): Promise<void> {
  await prisma.$executeRaw`CREATE OR REPLACE FUNCTION e2e_reject_todo_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'e2e: insert rejected'; END $$`;
  await prisma.$executeRaw`CREATE TRIGGER e2e_reject_todo_insert BEFORE INSERT ON todos FOR EACH ROW EXECUTE FUNCTION e2e_reject_todo_insert()`;
}

// IF EXISTS in beforeEach and afterEach: a run killed between install and drop would otherwise break every create in
// this schema until someone drops it by hand.
async function acceptTodoInserts(): Promise<void> {
  await prisma.$executeRaw`DROP TRIGGER IF EXISTS e2e_reject_todo_insert ON todos`;
  await prisma.$executeRaw`DROP FUNCTION IF EXISTS e2e_reject_todo_insert()`;
}

test.beforeEach(async () => {
  await acceptTodoInserts();
  await prisma.todo.deleteMany();
});

test.afterEach(async () => {
  await acceptTodoInserts();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

function newTodoBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'New todo' });
}

// A row in edit mode renders its own <form>; scope to the one holding the "New todo" box, as AC-10.5 counts there.
function newTodoFormAlerts(page: Page): Locator {
  return page
    .locator('form')
    .filter({ has: newTodoBox(page) })
    .getByRole('alert');
}

// §10 feedback when a mutation fails (B1.10: end-to-end proof of B1.5's create failure path).
test.describe('§10 feedback when a mutation fails', () => {
  test('AC-10.5: a create the database rejects shows 1 alert "Could not save, try again" in the form, keeps "Buy milk" in the box, "Add" enabled and the list unchanged; the next Add saves it once', async ({
    page,
  }) => {
    await prisma.todo.create({ data: { title: 'Walk the dog', createdAt: new Date(2026, 0, 1) } });
    await page.goto('/');
    await expect(page.getByRole('listitem')).toHaveText(['Walk the dog']);
    await rejectTodoInserts();

    await newTodoBox(page).fill('Buy milk');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(newTodoFormAlerts(page)).toHaveCount(1);
    await expect(newTodoFormAlerts(page)).toHaveText('Could not save, try again');
    await expect(newTodoBox(page)).toHaveValue('Buy milk');
    await expect(page.getByRole('button', { name: 'Add' })).toBeEnabled();
    await expect(page.getByRole('listitem')).toHaveText(['Walk the dog']);
    expect(await prisma.todo.count()).toBe(1);

    await acceptTodoInserts();
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(newTodoFormAlerts(page)).toHaveCount(0);
    await expect(newTodoBox(page)).toHaveValue('');
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk', 'Walk the dog']);
    expect(await prisma.todo.count({ where: { title: 'Buy milk' } })).toBe(1);
  });
});
