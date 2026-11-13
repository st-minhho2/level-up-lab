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

// REQ-30.2: the <span> that directly follows each link, in link order.
function countSpans(page: Page): Locator {
  return filterNav(page).locator('a + span');
}

async function expectCountsRead(page: Page, all: string, active: string, completed: string): Promise<void> {
  await expect(countSpans(page)).toHaveText([all, active, completed]);
}

async function expectExactLinkNames(page: Page): Promise<void> {
  await expect(filterLink(page, 'All')).toHaveCount(1);
  await expect(filterLink(page, 'Active')).toHaveCount(1);
  await expect(filterLink(page, 'Completed')).toHaveCount(1);
  await expect(filterNav(page).getByRole('link')).toHaveText(['All', 'Active', 'Completed']);
}

// Opens `/` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// REQ-30.4 "without a full reload": counts every document navigation of the main frame from now on.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// §30 filter counts (B6.2).
test.describe('§30 filter counts', () => {
  test('AC-30.5: on /, /?filter=active, /?filter=completed and /?q=zzz the spans read (4), (2), (2) in link order, the links keep their exact names, and the navigation holds 0 list items', async ({
    page,
  }) => {
    await seedInDisplayOrder([
      { title: 'D' },
      { title: 'C', completed: true },
      { title: 'B' },
      { title: 'A', completed: true },
    ]);

    for (const address of ['/', '/?filter=active', '/?filter=completed', '/?q=zzz']) {
      await page.goto(address);

      await expectCountsRead(page, '(4)', '(2)', '(2)');
      await expectExactLinkNames(page);
      await expect(filterNav(page).getByRole('listitem')).toHaveCount(0);
    }
  });

  test('AC-30.6: (3), (2), (1) becomes (3), (1), (2) after checking D, (3), (0), (3) after "Mark all complete" and after a reload, (0), (0), (0) after "Clear completed", with 0 document navigations during the first two steps', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'D' }, { title: 'C', completed: true }, { title: 'B' }]);
    await openHydrated(page);
    const navigations = watchNavigations(page);
    await expectCountsRead(page, '(3)', '(2)', '(1)');

    await page.getByRole('checkbox', { name: 'D', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'D', exact: true })).toBeChecked();
    await expectCountsRead(page, '(3)', '(1)', '(2)');

    await page.getByRole('button', { name: 'Mark all complete' }).click();

    await expectCountsRead(page, '(3)', '(0)', '(3)');
    expect(navigations()).toBe(0);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expectCountsRead(page, '(3)', '(0)', '(3)');

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expectCountsRead(page, '(0)', '(0)', '(0)');
  });

  test('AC-30.7: with no stored todo the spans read (0), (0), (0), "No todos yet" shows and there are 0 list items', async ({
    page,
  }) => {
    await page.goto('/');

    await expectCountsRead(page, '(0)', '(0)', '(0)');
    await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });
});
