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

// Opens `/` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// REQ-32.4 "without a full reload": counts every document navigation of the main frame from now on.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// §32 clear-completed count (B6.4).
test.describe('§32 clear-completed count', () => {
  test('AC-32.5: on /, /?filter=active, /?filter=completed and /?q=zzz the button is named exactly "Clear completed (2)" and is enabled', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'D' }, { title: 'C', completed: true }, { title: 'B', completed: true }]);

    for (const address of ['/', '/?filter=active', '/?filter=completed', '/?q=zzz']) {
      await page.goto(address);

      await expect(clearButton(page, 'Clear completed (2)')).toHaveCount(1);
      await expect(clearButton(page, 'Clear completed (2)')).toBeEnabled();
    }
  });

  test('AC-32.6: "Clear completed (2)" becomes "Clear completed (3)" after checking C, "Clear completed (2)" after unchecking C and after a reload, "Clear completed" disabled after the click, with 0 document navigations during the first two steps', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A', completed: true }]);
    await openHydrated(page);
    const navigations = watchNavigations(page);
    await expect(clearButton(page, 'Clear completed (2)')).toHaveCount(1);

    await page.getByRole('checkbox', { name: 'C', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'C', exact: true })).toBeChecked();
    await expect(clearButton(page, 'Clear completed (3)')).toHaveCount(1);

    await page.getByRole('checkbox', { name: 'C', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'C', exact: true })).not.toBeChecked();
    await expect(clearButton(page, 'Clear completed (2)')).toHaveCount(1);
    expect(navigations()).toBe(0);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(clearButton(page, 'Clear completed (2)')).toHaveCount(1);

    await clearButton(page, 'Clear completed (2)').click();

    await expect(page.getByRole('listitem')).toHaveText(['C']);
    await expect(clearButton(page, 'Clear completed')).toHaveCount(1);
    await expect(clearButton(page, 'Clear completed')).toBeDisabled();
  });

  test('AC-32.7: with no stored todo 1 button is named exactly "Clear completed", disabled, with "No todos yet" shown', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();
    await expect(clearButton(page, 'Clear completed')).toHaveCount(1);
    await expect(clearButton(page, 'Clear completed')).toBeDisabled();
  });
});
