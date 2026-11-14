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
// Titles are single letters, never "All done" nor "item left", so those texts can only come from §13 and §22.
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// The §34 element: the `status` whose text reads the §13 count. Other `status` elements on `/` (if any) are not it,
// so the locator is never a bare `getByRole('status')`.
function remainingStatus(page: Page): Locator {
  return page.getByRole('status').filter({ hasText: /items? left/ });
}

function allDoneIn(scope: Locator): Locator {
  return scope.getByText('All done', { exact: true });
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a
// native form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// "0 document navigations": counts main-frame document requests from now on. The App Router's same-document
// `history.replaceState` after a Server Action fires `framenavigated` but loads no document, so it is not counted.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

const HELD = 'data-ac-34-5-held';

test.describe('§34 the remaining count is announced to assistive technology', () => {
  test('AC-34.4: with no stored todo, exactly 1 status contains "0 items left" and exactly 1 "All done", and there is no listitem', async ({
    page,
  }) => {
    await page.goto('/');

    const status = remainingStatus(page);
    await expect(status).toHaveCount(1);
    await expect(status).toContainText('0 items left');
    await expect(allDoneIn(status)).toHaveCount(1);
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('AC-34.5: C open, B done: the count status is the same node before and after; it reads "1 item left", then "0 items left" with "All done" after checking C, then "1 item left" after unchecking C, with 0 document navigations', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }]);
    await openHydrated(page, '/');
    const navigations = watchNavigations(page);
    const status = remainingStatus(page);
    const checkboxC = page.getByRole('checkbox', { name: 'C', exact: true });
    await expect(status).toHaveCount(1);
    await expect(status).toContainText('1 item left');
    await expect(allDoneIn(status)).toHaveCount(0);
    await status.evaluate((node, name) => {
      node.setAttribute(name, 'held');
    }, HELD);

    await checkboxC.click();

    await expect(checkboxC).toBeChecked();
    await expect(status).toHaveCount(1);
    await expect(status).toContainText('0 items left');
    await expect(allDoneIn(status)).toHaveCount(1);
    await expect(status).toHaveAttribute(HELD, 'held');

    await checkboxC.click();

    await expect(checkboxC).not.toBeChecked();
    await expect(status).toHaveCount(1);
    await expect(status).toContainText('1 item left');
    await expect(allDoneIn(status)).toHaveCount(0);
    await expect(status).toHaveAttribute(HELD, 'held');
    await expect(page.locator(`[${HELD}]`)).toHaveCount(1);
    expect(navigations()).toBe(0);
  });

  test('AC-34.6: B, A done on /?filter=active show 0 listitems and exactly 1 status containing "0 items left" and exactly 1 "All done"', async ({
    page,
  }) => {
    await seedInDisplayOrder([
      { title: 'B', completed: true },
      { title: 'A', completed: true },
    ]);

    await page.goto('/?filter=active');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    const status = remainingStatus(page);
    await expect(status).toHaveCount(1);
    await expect(status).toContainText('0 items left');
    await expect(allDoneIn(status)).toHaveCount(1);
  });
});
