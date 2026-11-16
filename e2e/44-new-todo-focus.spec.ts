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

// Rows are given in display order: the list is `createdAt desc` (§5 REQ-5.1), so index 0 gets the newest createdAt.
// No due date is seeded, so a row's text is its title alone.
async function seedInDisplayOrder(rows: readonly { readonly title: string }[]): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

function rows(page: Page): Locator {
  return page.getByRole('listitem');
}

function newTodoBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'New todo' });
}

function addButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Add' });
}

// A row in edit mode renders its own <form>; scope to the one holding the "New todo" box, which also keeps Next's
// route announcer out of the alert count.
function newTodoForm(page: Page): Locator {
  return page.locator('form').filter({ has: newTodoBox(page) });
}

// The §25 search box, as `e2e/25-search-shortcut.spec.ts` names it.
function searchBox(page: Page): Locator {
  return page.getByRole('search').getByRole('searchbox', { name: 'Search todos' });
}

// The form's focus handling and the `/` shortcut are attached by React, so nothing is judged before hydration.
// Waits until the network is idle, React has attached its fiber to the box, and two frames plus a task have passed.
async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const box = document.getElementById('new-todo');
    return box !== null && Object.keys(box).some((name) => name.startsWith('__reactFiber'));
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)));
      }),
  );
}

// §44 after a successful add, focus is in the "New todo" box (B9.1).
test.describe('§44 after a successful add, focus is in the "New todo" box', () => {
  test('AC-44.6: the box is not focused on load; after adding Buy milk the list shows [Buy milk] and the box is focused with ""; after Walk the dog and Enter the rows are [Walk the dog, Buy milk] and the box is focused with ""; after a reload the box is not focused and the rows are [Walk the dog, Buy milk]', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);

    await expect(newTodoBox(page)).not.toBeFocused();

    await newTodoBox(page).click();
    await page.keyboard.type('Buy milk');
    await addButton(page).click();

    await expect(rows(page)).toHaveText(['Buy milk']);
    await expect(newTodoBox(page)).toBeFocused();
    await expect(newTodoBox(page)).toHaveValue('');

    await page.keyboard.type('Walk the dog');
    await page.keyboard.press('Enter');

    await expect(rows(page)).toHaveText(['Walk the dog', 'Buy milk']);
    await expect(newTodoBox(page)).toBeFocused();
    await expect(newTodoBox(page)).toHaveValue('');

    await page.reload();
    await waitForHydration(page);

    await expect(newTodoBox(page)).not.toBeFocused();
    await expect(rows(page)).toHaveText(['Walk the dog', 'Buy milk']);
  });

  test('AC-44.7: exactly 1 alert reads Title is required, the list still reads [Buy milk], the box is not focused after the click, and the / press focuses "Search todos" (§25) and the "New todo" box\'s value is "" (§18 REQ-18.6)', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy milk' }]);
    await page.goto('/');
    await waitForHydration(page);
    await newTodoBox(page).fill('   ');

    await addButton(page).click();

    await expect(newTodoForm(page).getByRole('alert')).toHaveCount(1);
    await expect(newTodoForm(page).getByRole('alert')).toHaveText('Title is required');
    await expect(rows(page)).toHaveText(['Buy milk']);
    await expect(newTodoBox(page)).not.toBeFocused();

    await page.keyboard.press('/');

    await expect(searchBox(page)).toBeFocused();
    await expect(newTodoBox(page)).toHaveValue('');
  });
});
