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
// No due date is seeded, so a row's text is its title alone.
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// AC-38.5's store: D "Buy milk" (open), C "Milkshake" (done), B "Call mom" (open), A "Walk the dog" (done).
async function seedFourTodos(): Promise<void> {
  await seedInDisplayOrder([
    { title: 'Buy milk' },
    { title: 'Milkshake', completed: true },
    { title: 'Call mom' },
    { title: 'Walk the dog', completed: true },
  ]);
}

async function storedTodos(): Promise<{ titles: string[]; completed: boolean[] }> {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
    select: { title: true, completed: true },
  });
  return { titles: todos.map((todo) => todo.title), completed: todos.map((todo) => todo.completed) };
}

function rows(page: Page): Locator {
  return page.getByRole('listitem');
}

function exactText(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

// Any §38 count text, "N match" or "N matches", as the whole text of an element.
const COUNT_TEXT = /^\d+ match(es)?$/;

function countTexts(page: Page): Locator {
  return page.getByText(COUNT_TEXT);
}

// "The number in a count text equals the number of rows": with a count text on the page, its number is the row count.
async function expectCountMatchesRows(page: Page): Promise<void> {
  const texts = await countTexts(page).allTextContents();
  const rowCount = await rows(page).count();
  expect(texts.map((text) => Number.parseInt(text, 10))).toEqual(texts.length === 0 ? [] : [rowCount]);
}

// REQ-38.5 "without a full reload": counts every document navigation of the main frame from now on. A Server Action
// is a fetch and never counts; a native form POST, a reload or a link to another page does.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// The §13 remaining count, whatever its number (the pattern e2e §23 and §33 use).
function remainingCount(page: Page): Locator {
  return page.getByText(/^\d+ items? left$/);
}

// §32 and §36 append "(n)" to both labels, so the name is matched with or without it.
function completeAllButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Mark all complete( \(\d+\))?$/ });
}

function clearCompletedButton(page: Page): Locator {
  return page.getByRole('button', { name: /^Clear completed( \(\d+\))?$/ });
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// §38 search match count (B7.4).
test.describe('§38 search match count', () => {
  test('AC-38.5: /?q=milk shows "2 matches" once with [D, C] and "2 items left" once, /?filter=active&q=milk "1 match" once with [D], /?q=zzz 0 rows, one "No todos match your search" and 0 count texts, / and /?q=%20%20 4 rows and 0 count texts, and every count text equals the number of rows', async ({
    page,
  }) => {
    await seedFourTodos();

    await page.goto('/?q=milk');

    await expect(rows(page)).toHaveText(['Buy milk', 'Milkshake']);
    await expect(exactText(page, '2 matches')).toHaveCount(1);
    await expect(exactText(page, '2 items left')).toHaveCount(1);
    await expect(countTexts(page)).toHaveCount(1);
    await expectCountMatchesRows(page);

    await page.goto('/?filter=active&q=milk');

    await expect(rows(page)).toHaveText(['Buy milk']);
    await expect(exactText(page, '1 match')).toHaveCount(1);
    await expect(countTexts(page)).toHaveCount(1);
    await expectCountMatchesRows(page);

    await page.goto('/?q=zzz');

    await expect(rows(page)).toHaveCount(0);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(1);
    await expect(countTexts(page)).toHaveCount(0);
    await expectCountMatchesRows(page);

    for (const path of ['/', '/?q=%20%20']) {
      await page.goto(path);

      await expect(rows(page)).toHaveText(['Buy milk', 'Milkshake', 'Call mom', 'Walk the dog']);
      await expect(countTexts(page)).toHaveCount(0);
      await expectCountMatchesRows(page);
    }
  });

  test('AC-38.6: on /?filter=active&q=milk with [D] and "1 match", ticking D leaves 0 rows, one "No todos match your search", 0 count texts and 0 document navigations, the same after a reload, and /?q=milk then shows [D, C] and "2 matches" once', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/?filter=active&q=milk');
    await expect(rows(page)).toHaveText(['Buy milk']);
    await expect(exactText(page, '1 match')).toHaveCount(1);
    const navigations = watchNavigations(page);

    await page.getByRole('checkbox', { name: 'Buy milk', exact: true }).click();

    await expect(rows(page)).toHaveCount(0);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(1);
    await expect(countTexts(page)).toHaveCount(0);
    expect(navigations()).toBe(0);

    await page.reload();

    await expect(rows(page)).toHaveCount(0);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(1);
    await expect(countTexts(page)).toHaveCount(0);

    await page.goto('/?q=milk');

    await expect(rows(page)).toHaveText(['Buy milk', 'Milkshake']);
    await expect(exactText(page, '2 matches')).toHaveCount(1);
  });

  test('AC-38.7: opening /?q=milk and /?q=zzz leaves the stored titles and completed flags equal to the snapshot, "Mark all complete" and "Clear completed" enabled, and the "N items left" text unchanged between the two addresses', async ({
    page,
  }) => {
    await seedFourTodos();
    const snapshot = await storedTodos();

    await openHydrated(page, '/?q=milk');

    await expect(rows(page)).toHaveText(['Buy milk', 'Milkshake']);
    await expect(remainingCount(page)).toHaveCount(1);
    const remainingOnMilk = await remainingCount(page).textContent();
    await expect(completeAllButton(page)).toHaveCount(1);
    await expect(completeAllButton(page)).toBeEnabled();
    await expect(clearCompletedButton(page)).toHaveCount(1);
    await expect(clearCompletedButton(page)).toBeEnabled();

    await openHydrated(page, '/?q=zzz');

    await expect(rows(page)).toHaveCount(0);
    await expect(remainingCount(page)).toHaveCount(1);
    const remainingOnZzz = await remainingCount(page).textContent();
    await expect(completeAllButton(page)).toHaveCount(1);
    await expect(completeAllButton(page)).toBeEnabled();
    await expect(clearCompletedButton(page)).toHaveCount(1);
    await expect(clearCompletedButton(page)).toBeEnabled();
    expect(remainingOnMilk).toBe('2 items left');
    expect(remainingOnZzz).toBe(remainingOnMilk);
    expect(await storedTodos()).toEqual(snapshot);
  });
});
