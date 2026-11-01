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

function newTodoBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'New todo' });
}

// A row in edit mode renders its own <form>; scope to the one holding the "New todo" box.
function counter(page: Page): Locator {
  return page
    .locator('form')
    .filter({ has: newTodoBox(page) })
    .getByText(/^\d+ \/ 200$/);
}

async function expectCounterReads(page: Page, text: string): Promise<void> {
  await expect(counter(page)).toHaveCount(1);
  await expect(counter(page)).toHaveText(text);
  await expect(newTodoBox(page)).toHaveAttribute('aria-describedby', 'new-todo-count');
}

// Opens `/` and waits for the client to hydrate, so typing reaches React's input handler and "Add" goes through the
// Server Action rather than a native form POST.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// §18 the new-todo title counter (B3.2).
test.describe('§18 title counter', () => {
  test('AC-18.7: the counter reads 0, 8, 200 (still 200 after a refused y), 195, then 0 after adding Walk the dog and 0 after a reload, with aria-describedby new-todo-count throughout', async ({
    page,
  }) => {
    await openHydrated(page);
    await expectCounterReads(page, '0 / 200');

    await newTodoBox(page).fill('Buy milk');

    await expectCounterReads(page, '8 / 200');

    await newTodoBox(page).fill('x'.repeat(200));

    await expectCounterReads(page, '200 / 200');

    await newTodoBox(page).press('y');

    await expect(newTodoBox(page)).toHaveValue('x'.repeat(200));
    await expectCounterReads(page, '200 / 200');

    await newTodoBox(page).fill(' '.repeat(5) + 'x'.repeat(195));

    await expectCounterReads(page, '195 / 200');

    await newTodoBox(page).fill('Walk the dog');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('listitem')).toHaveText(['Walk the dog']);
    await expect(newTodoBox(page)).toHaveValue('');
    await expectCounterReads(page, '0 / 200');

    await page.reload();

    await expectCounterReads(page, '0 / 200');
  });
});
