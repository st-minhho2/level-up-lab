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

function newTodoBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'New todo' });
}

// A row in edit mode renders its own <form>; scope to the one holding the "New todo" box.
function newTodoForm(page: Page): Locator {
  return page.locator('form').filter({ has: newTodoBox(page) });
}

function counter(page: Page): Locator {
  return newTodoForm(page).getByText(/^\d+ \/ 200$/);
}

function warning(page: Page): Locator {
  return page.locator('#new-todo-warning');
}

async function expectCounterReads(page: Page, text: string): Promise<void> {
  await expect(counter(page)).toHaveCount(1);
  await expect(counter(page)).toHaveText(text);
  await expect(newTodoBox(page)).toHaveAttribute('aria-describedby', 'new-todo-count');
}

async function expectWarningShown(page: Page): Promise<void> {
  await expect(warning(page)).toHaveCount(1);
  await expect(warning(page)).toBeVisible();
  await expect(warning(page)).toHaveText('Almost at the character limit');
}

// Opens `/` and waits for the client to hydrate, so typing reaches React's input handler and "Add" goes through the
// Server Action rather than a native form POST.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// §39 the new-todo counter warns near the limit (B7.5).
test.describe('§39 title counter warning', () => {
  test('AC-39.7: 0 warnings on load and at 179, 1 visible "Almost at the character limit" at 180 and 200, the counter reading 0, 179, 180, 200 / 200 with aria-describedby new-todo-count, then 1 row Walk the dog and 0 warnings after Add and after a reload', async ({
    page,
  }) => {
    await openHydrated(page);

    await expect(warning(page)).toHaveCount(0);
    await expectCounterReads(page, '0 / 200');

    await newTodoBox(page).fill('x'.repeat(179));

    await expectCounterReads(page, '179 / 200');
    await expect(warning(page)).toHaveCount(0);

    await newTodoBox(page).fill('x'.repeat(180));

    await expectCounterReads(page, '180 / 200');
    await expectWarningShown(page);

    await newTodoBox(page).fill('x'.repeat(200));

    await expectCounterReads(page, '200 / 200');
    await expectWarningShown(page);

    await newTodoBox(page).fill('Walk the dog');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('listitem')).toHaveText(['Walk the dog']);
    await expect(warning(page)).toHaveCount(0);
    await expectCounterReads(page, '0 / 200');

    await page.reload();

    await expect(warning(page)).toHaveCount(0);
    await expectCounterReads(page, '0 / 200');
  });
});
