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
async function seedInDisplayOrder(rows: readonly { readonly title: string }[]): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({ data: { title: row.title, createdAt: new Date(2026, 0, rows.length - index) } });
  }
}

// Opens `/` and waits for the client to hydrate, so Escape reaches React's handler and a save would be a Server
// Action POST, not a lost event.
async function openHydrated(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

// Collects every POST to `/` (a Server Action call) from the moment it is called; the returned array grows live.
function recordPostsToRoot(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/') {
      posts.push(request.url());
    }
  });
  return posts;
}

// Reads, in the page, whether `element` is document.activeElement.
async function isActiveElement(element: Locator): Promise<boolean> {
  return element.evaluate((node) => document.activeElement === node);
}

function searchBox(page: Page): Locator {
  return page.getByRole('search').getByRole('searchbox', { name: 'Search todos' });
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

test.describe('§48 Escape from the title editor focuses "Edit title"', () => {
  test('AC-48.7: after the Escape the active element is "Edit title" in B\'s row, 0 textbox roles in the list and 0 POSTs to /; after / "Search todos" is focused at /; after the reload the list reads [C, Buy mik, A]', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'Buy mik' }, { title: 'A' }]);
    await openHydrated(page);
    await expect(page.getByRole('listitem')).toHaveText(['C', 'Buy mik', 'A']);
    // The row is addressed by position because its text and controls change while it is being edited.
    const rowB = page.getByRole('listitem').nth(1);
    await rowB.getByRole('button', { name: 'Edit title' }).click();
    const field = rowB.getByRole('textbox', { name: 'Edit title' });
    await expect(field).toBeVisible();
    await page.keyboard.press('Z');
    await expect(field).toHaveValue('Z');
    const posts = recordPostsToRoot(page);

    await field.press('Escape');

    const editTitle = rowB.getByRole('button', { name: 'Edit title' });
    await expect(editTitle).toHaveCount(1);
    await expect.poll(() => isActiveElement(editTitle)).toBe(true);
    await expect(page.getByRole('listitem').getByRole('textbox')).toHaveCount(0);
    expect(posts).toEqual([]);

    await page.keyboard.press('/');

    await expect.poll(() => isActiveElement(searchBox(page))).toBe(true);
    await expect(page).toHaveURL(addressIs('/'));

    await page.reload();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'Buy mik', 'A']);
  });
});
