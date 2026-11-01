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
// Titles are single letters, never "All done", so an exact "All done" match can only be the §22 message.
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

function exactText(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

// "Exactly one element with the text …".
async function expectOne(page: Page, text: string): Promise<void> {
  await expect(exactText(page, text)).toHaveCount(1);
  await expect(exactText(page, text)).toBeVisible();
}

// Opens `/` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST; a click before hydration would itself be a navigation.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// REQ-22.6 "without a full reload": counts every document navigation of the main frame from now on. A Server Action
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

// §22 all done (B4.3).
test.describe('§22 all done', () => {
  test('AC-22.4: B (done), A (done) show exactly one "0 items left" and one "All done", and 2 listitems, none containing "All done"', async ({
    page,
  }) => {
    await seedInDisplayOrder([
      { title: 'B', completed: true },
      { title: 'A', completed: true },
    ]);

    await page.goto('/');

    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    await expect(page.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('listitem').filter({ hasText: 'All done' })).toHaveCount(0);
  });

  test('AC-22.5: an empty list shows exactly one "0 items left", one "No todos yet" and one "All done", and no listitem', async ({
    page,
  }) => {
    await page.goto('/');

    await expectOne(page, '0 items left');
    await expectOne(page, 'No todos yet');
    await expectOne(page, 'All done');
    await expect(page.getByRole('listitem')).toHaveCount(0);
  });

  test('AC-22.6: C (open), B (done): "All done" shows after checking C, goes after unchecking C, shows after "Mark all complete" and after a reload, and stays with "No todos yet" after "Clear completed", with no navigation before the reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }]);
    await openHydrated(page);
    const navigations = watchNavigations(page);
    const boxC = page.getByRole('checkbox', { name: 'C', exact: true });
    await expectOne(page, '1 item left');
    await expect(exactText(page, 'All done')).toHaveCount(0);

    await boxC.click();

    await expect(boxC).toBeChecked();
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');

    await boxC.click();

    await expect(boxC).not.toBeChecked();
    await expectOne(page, '1 item left');
    await expect(exactText(page, 'All done')).toHaveCount(0);

    await page.getByRole('button', { name: 'Mark all complete' }).click();

    await expect(boxC).toBeChecked();
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    expect(navigations()).toBe(0);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');

    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    await expectOne(page, 'No todos yet');
  });

  test('AC-22.7: B, A done on /?filter=active and /?q=zzz show no listitem, one "0 items left" and one "All done"; B open, A done on /?filter=completed read [A], one "1 item left" and no "All done"', async ({
    page,
  }) => {
    await seedInDisplayOrder([
      { title: 'B', completed: true },
      { title: 'A', completed: true },
    ]);

    await page.goto('/?filter=active');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    await expectOne(page, 'No active todos');

    await page.goto('/?q=zzz');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expectOne(page, '0 items left');
    await expectOne(page, 'All done');
    await expectOne(page, 'No todos match your search');

    await prisma.todo.deleteMany();
    await seedInDisplayOrder([{ title: 'B' }, { title: 'A', completed: true }]);

    await page.goto('/?filter=completed');

    await expect(page.getByRole('listitem')).toHaveText(['A']);
    await expectOne(page, '1 item left');
    await expect(exactText(page, 'All done')).toHaveCount(0);
  });
});
