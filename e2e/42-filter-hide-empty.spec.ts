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

function filterNav(page: Page): Locator {
  return page.getByRole('navigation', { name: 'Filter todos' });
}

function filterLink(page: Page, name: 'All' | 'Active' | 'Completed'): Locator {
  return filterNav(page).getByRole('link', { name, exact: true });
}

// The links the navigation renders, in order, the span directly after each, and no other span.
async function expectLinksWithCounts(page: Page, names: readonly string[], spans: readonly string[]): Promise<void> {
  await expect(filterNav(page).getByRole('link')).toHaveText([...names]);
  await expect(filterNav(page).locator('a + span')).toHaveText([...spans]);
  await expect(filterNav(page).locator('span')).toHaveCount(spans.length);
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

// Opens `/` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// Counts every document navigation of the main frame from now on.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// §42 the filter nav hides a link whose count is 0 (B8.2).
test.describe('§42 filter nav hides empty links', () => {
  test('AC-42.5: All, Active with (2), (2) and 0 links Completed; after "Mark all complete" and a reload All, Completed with (2), (2) and 0 links Active; after "Clear completed" exactly 1 link All with 1 span (0) and "No todos yet"; 0 document navigations during the first step', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'B' }, { title: 'A' }]);
    await openHydrated(page);
    const navigations = watchNavigations(page);

    await expectLinksWithCounts(page, ['All', 'Active'], ['(2)', '(2)']);
    await expect(filterLink(page, 'Completed')).toHaveCount(0);

    await page.getByRole('button', { name: 'Mark all complete' }).click();

    await expectLinksWithCounts(page, ['All', 'Completed'], ['(2)', '(2)']);
    await expect(filterLink(page, 'Active')).toHaveCount(0);
    expect(navigations()).toBe(0);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expectLinksWithCounts(page, ['All', 'Completed'], ['(2)', '(2)']);
    await expect(filterLink(page, 'Active')).toHaveCount(0);

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expectLinksWithCounts(page, ['All'], ['(0)']);
    await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();
  });

  test('AC-42.6: on /?filter=completed All, Active, Completed with (2), (2), (0), aria-current only on Completed and "No completed todos"; after clicking All the address is / with All, Active, (2), (2) and 0 links Completed', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'B' }, { title: 'A' }]);

    await page.goto('/?filter=completed');

    await expectLinksWithCounts(page, ['All', 'Active', 'Completed'], ['(2)', '(2)', '(0)']);
    await expect(filterLink(page, 'Completed')).toHaveAttribute('aria-current', 'page');
    await expect(filterLink(page, 'All')).not.toHaveAttribute('aria-current');
    await expect(filterLink(page, 'Active')).not.toHaveAttribute('aria-current');
    await expect(page.getByText('No completed todos', { exact: true })).toBeVisible();

    await filterLink(page, 'All').click();

    await expect(page).toHaveURL(addressIs('/'));
    await expectLinksWithCounts(page, ['All', 'Active'], ['(2)', '(2)']);
    await expect(filterLink(page, 'Completed')).toHaveCount(0);
  });

  test('AC-42.7: with no stored todo /, /?filter=active and /?filter=completed each show 1 "Filter todos" navigation holding exactly 1 link, All, Active, Completed in turn, with aria-current="page" and 1 span (0), "No todos yet" and 0 list items', async ({
    page,
  }) => {
    const cases = [
      { address: '/', name: 'All' },
      { address: '/?filter=active', name: 'Active' },
      { address: '/?filter=completed', name: 'Completed' },
    ] as const;

    for (const { address, name } of cases) {
      await page.goto(address);

      await expect(filterNav(page)).toHaveCount(1);
      await expectLinksWithCounts(page, [name], ['(0)']);
      await expect(filterLink(page, name)).toHaveAttribute('aria-current', 'page');
      await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();
      await expect(page.getByRole('listitem')).toHaveCount(0);
    }
  });
});
