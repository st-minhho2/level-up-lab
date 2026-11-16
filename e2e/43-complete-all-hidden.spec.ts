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
// Titles are single letters, so an exact "All done" or "0 items left" match can only be the §22 / §13 text.
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// "Buttons whose name contains "Mark all complete"", with or without a count.
function anyMarkAllButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Mark all complete' });
}

// The button found by its exact accessible name, so "Mark all complete" does not match "Mark all complete (2)".
function markAllButtonNamed(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true });
}

// "Exactly one element with the text …".
async function expectOne(page: Page, text: string): Promise<void> {
  await expect(page.getByText(text, { exact: true })).toHaveCount(1);
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST; a click before hydration would itself be a navigation.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// REQ-43.3 "without a full reload": counts every document navigation of the main frame from now on.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// AC-43.5 "0 such buttons, one "0 items left", one "All done", the list reads [C, B, A] with all 3 checked".
async function expectMarkedAllWithoutButton(page: Page): Promise<void> {
  await expect(anyMarkAllButton(page)).toHaveCount(0);
  await expectOne(page, '0 items left');
  await expectOne(page, 'All done');
  await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
  await expect(page.getByRole('checkbox')).toHaveCount(3);
  await expect(page.getByRole('checkbox', { name: 'C', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'A', exact: true })).toBeChecked();
}

// AC-43.7 "0 elements with text "Nothing to mark" or "No todos to mark"": no message replaces the button (REQ-43.6).
async function expectNoPlaceholderMessage(page: Page): Promise<void> {
  await expect(page.getByText('Nothing to mark')).toHaveCount(0);
  await expect(page.getByText('No todos to mark')).toHaveCount(0);
}

// §43 "Mark all complete" hidden when there is nothing to mark (B8.3).
test.describe('§43 complete-all hidden', () => {
  test('AC-43.5: after clicking "Mark all complete (2)" and after a reload 0 "Mark all complete" buttons, one "0 items left", one "All done", [C, B, A] all checked, 0 navigations before the reload, focus on BODY after the click', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page, '/');
    await expect(markAllButtonNamed(page, 'Mark all complete (2)')).toHaveCount(1);
    const navigations = watchNavigations(page);

    await markAllButtonNamed(page, 'Mark all complete (2)').click();

    await expectMarkedAllWithoutButton(page);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');
    expect(navigations()).toBe(0);

    await page.reload();

    await expectMarkedAllWithoutButton(page);
  });

  test('AC-43.6: checking A removes the button, unchecking A brings back exactly 1 enabled "Mark all complete (1)" with 0 alerts, the same after a reload, with 0 navigations during the check and the uncheck', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page, '/');
    await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toHaveCount(1);
    const navigations = watchNavigations(page);

    await page.getByRole('checkbox', { name: 'A', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'A', exact: true })).toBeChecked();
    await expect(anyMarkAllButton(page)).toHaveCount(0);

    await page.getByRole('checkbox', { name: 'A', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'A', exact: true })).not.toBeChecked();
    await expect(anyMarkAllButton(page)).toHaveCount(1);
    await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toHaveCount(1);
    await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toBeEnabled();
    await expect(page.getByRole('alert')).toHaveCount(0);
    expect(navigations()).toBe(0);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(anyMarkAllButton(page)).toHaveCount(1);
    await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toHaveCount(1);
    await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toBeEnabled();
  });

  test('AC-43.7: no button and the rest of the page as usual with no todo and with all done under ?filter=active; exactly 1 enabled "Mark all complete (1)" under ?filter=completed and ?q=zzz; never a "Nothing to mark" or "No todos to mark" text', async ({
    page,
  }) => {
    // (a) no stored todo, on /.
    await page.goto('/');

    await expect(anyMarkAllButton(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Clear completed' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeDisabled();
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    await expectOne(page, 'No todos yet');
    await expectNoPlaceholderMessage(page);

    // (b) B (done), A (done), on /?filter=active.
    await prisma.todo.deleteMany();
    await seedInDisplayOrder([
      { title: 'B', completed: true },
      { title: 'A', completed: true },
    ]);
    await page.goto('/?filter=active');

    await expect(anyMarkAllButton(page)).toHaveCount(0);
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    await expectOne(page, 'No active todos');
    await expectNoPlaceholderMessage(page);

    // (c) B (open), A (done), on /?filter=completed and on /?q=zzz.
    await prisma.todo.deleteMany();
    await seedInDisplayOrder([{ title: 'B' }, { title: 'A', completed: true }]);
    for (const address of ['/?filter=completed', '/?q=zzz']) {
      await page.goto(address);

      await expect(anyMarkAllButton(page)).toHaveCount(1);
      await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toHaveCount(1);
      await expect(markAllButtonNamed(page, 'Mark all complete (1)')).toBeEnabled();
      await expectNoPlaceholderMessage(page);
    }
  });
});
