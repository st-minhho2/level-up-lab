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

function clearButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Clear completed' });
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

async function expectFilterLinksVisible(page: Page): Promise<void> {
  await expect(filterNav(page).getByRole('link')).toHaveText(['All', 'Active', 'Completed']);
  await expect(filterLink(page, 'All')).toBeVisible();
  await expect(filterLink(page, 'Active')).toBeVisible();
  await expect(filterLink(page, 'Completed')).toBeVisible();
}

// §12 filter the list (B2.1).
test.describe('§12 filter the list', () => {
  test('AC-12.5: All, Active and Completed show [D, C, B, A], [D, B], [C, A] through the address, survive a reload, and an unknown filter shows All', async ({
    page,
  }) => {
    await seedInDisplayOrder([
      { title: 'D' },
      { title: 'C', completed: true },
      { title: 'B' },
      { title: 'A', completed: true },
    ]);
    await page.goto('/');
    await expect(page.getByRole('listitem')).toHaveText(['D', 'C', 'B', 'A']);

    await filterLink(page, 'Active').click();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(page.getByRole('listitem')).toHaveText(['D', 'B']);

    await page.reload();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(page.getByRole('listitem')).toHaveText(['D', 'B']);

    await filterLink(page, 'Completed').click();

    await expect(page).toHaveURL(addressIs('/?filter=completed'));
    await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);

    await filterLink(page, 'All').click();

    await expect(page).toHaveURL(addressIs('/'));
    await expect(page.getByRole('listitem')).toHaveText(['D', 'C', 'B', 'A']);

    await page.goto('/?filter=bogus');

    await expect(page.getByRole('listitem')).toHaveText(['D', 'C', 'B', 'A']);
    await expect(filterLink(page, 'All')).toHaveAttribute('aria-current', 'page');
    await expect(filterLink(page, 'Active')).not.toHaveAttribute('aria-current');
    await expect(filterLink(page, 'Completed')).not.toHaveAttribute('aria-current');
  });

  test('AC-12.6: under Active a checked todo leaves the list, the filter stays, and Clear completed follows the stored todos', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'D' }, { title: 'C', completed: true }, { title: 'B' }]);
    await page.goto('/?filter=active');

    await expect(page.getByRole('listitem')).toHaveText(['D', 'B']);
    await expect(clearButton(page)).toBeEnabled();

    await page.getByRole('checkbox', { name: 'D', exact: true }).click();

    await expect(page.getByRole('listitem')).toHaveText(['B']);
    await expect(page).toHaveURL(addressIs('/?filter=active'));

    await clearButton(page).click();

    await expect
      .poll(async () => prisma.todo.findMany({ orderBy: { createdAt: 'desc' }, select: { title: true } }))
      .toEqual([{ title: 'B' }]);
    await expect(page.getByRole('listitem')).toHaveText(['B']);
    await expect(clearButton(page)).toBeDisabled();
    await expect(page).toHaveURL(addressIs('/?filter=active'));
  });

  test('AC-12.7: an empty view keeps the three filter links, shows no list items and reads "No todos yet", "No completed todos" or "No active todos"', async ({
    page,
  }) => {
    await page.goto('/?filter=completed');

    await expectFilterLinksVisible(page);
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText('No todos yet', { exact: true })).toBeVisible();

    await seedInDisplayOrder([{ title: 'B' }, { title: 'A' }]);
    await page.goto('/?filter=completed');

    await expectFilterLinksVisible(page);
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText('No completed todos', { exact: true })).toBeVisible();

    await prisma.todo.deleteMany();
    await seedInDisplayOrder([
      { title: 'B', completed: true },
      { title: 'A', completed: true },
    ]);
    await page.goto('/?filter=active');

    await expectFilterLinksVisible(page);
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText('No active todos', { exact: true })).toBeVisible();
  });
});
