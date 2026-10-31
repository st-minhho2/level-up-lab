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
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

function countText(page: Page, label: string): Locator {
  return page.getByText(label, { exact: true });
}

// "The text reads <label>": exactly one element carries it.
async function expectCountReads(page: Page, label: string): Promise<void> {
  await expect(countText(page, label)).toHaveCount(1);
  await expect(countText(page, label)).toBeVisible();
}

// Opens `/` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST; a click before hydration would itself be a navigation.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// REQ-13.3 "without a full reload": counts every document navigation of the main frame from now on. A Server Action
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

async function addTodo(page: Page, title: string): Promise<void> {
  await page.getByRole('textbox', { name: 'New todo' }).fill(title);
  await page.getByRole('button', { name: 'Add' }).click();
}

// §13 remaining count (B2.2).
test.describe('§13 remaining count', () => {
  test('AC-13.3: an empty list shows exactly one "0 items left" and one "No todos yet", and no listitem', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(countText(page, '0 items left')).toHaveCount(1);
    await expect(countText(page, 'No todos yet')).toHaveCount(1);
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('AC-13.4: C (open), B (done), A (open) show exactly one "2 items left" and 3 listitems, none of them the count', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);

    await page.goto('/');

    await expect(countText(page, '2 items left')).toHaveCount(1);
    await expect(page.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    await expect(page.getByRole('listitem').filter({ hasText: 'items left' })).toHaveCount(0);
  });

  test('AC-13.5: the text reads "0 items left", then "1 item left" after adding A, then "2 items left" after adding B, with no navigation', async ({
    page,
  }) => {
    await openHydrated(page);
    const address = page.url();
    const navigations = watchNavigations(page);
    await expectCountReads(page, '0 items left');

    await addTodo(page, 'A');

    await expect(page.getByRole('listitem')).toHaveText(['A']);
    await expectCountReads(page, '1 item left');
    await expect(countText(page, '0 items left')).toHaveCount(0);

    await addTodo(page, 'B');

    await expect(page.getByRole('listitem')).toHaveText(['B', 'A']);
    await expectCountReads(page, '2 items left');
    await expect(countText(page, '1 item left')).toHaveCount(0);
    expect(navigations()).toBe(0);
    expect(page.url()).toBe(address);
  });

  test('AC-13.6: the text reads "2 items left", then "1 item left" after checking C, then "2 items left" after unchecking C, with no navigation', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B' }]);
    await openHydrated(page);
    const address = page.url();
    const navigations = watchNavigations(page);
    const boxC = page.getByRole('checkbox', { name: 'C', exact: true });
    await expectCountReads(page, '2 items left');

    await boxC.click();

    await expect(boxC).toBeChecked();
    await expectCountReads(page, '1 item left');
    await expect(countText(page, '2 items left')).toHaveCount(0);

    await boxC.click();

    await expect(boxC).not.toBeChecked();
    await expectCountReads(page, '2 items left');
    await expect(countText(page, '1 item left')).toHaveCount(0);
    expect(navigations()).toBe(0);
    expect(page.url()).toBe(address);
  });

  test('AC-13.7: the text reads "2 items left" before "Clear completed", after it and after a reload, and the list reads [C, A]', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page);
    await expectCountReads(page, '2 items left');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
    await expectCountReads(page, '2 items left');

    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
    await expectCountReads(page, '2 items left');
  });
});
