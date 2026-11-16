import { expect, test, type Locator, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL loaded by playwright.config.ts).
const prisma = new PrismaClient();

const HINT = 'Press / to search';

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

function rows(page: Page): Locator {
  return page.getByRole('listitem');
}

function searchBox(page: Page): Locator {
  return page.getByRole('search').getByRole('searchbox', { name: 'Search todos' });
}

// jsdom has no `:placeholder-shown`, so the browser reads it (§50 Function contracts).
async function isPlaceholderShown(page: Page): Promise<boolean> {
  return searchBox(page).evaluate((box) => box.matches(':placeholder-shown'));
}

// §25 listens from an effect and §27 from a React handler, so keys do nothing before hydration. Waits until the
// network is idle, React has attached its fiber to the search box, and two frames plus a task have passed.
async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const box = document.getElementById('search-todos');
    return box !== null && Object.keys(box).some((name) => name.startsWith('__reactFiber'));
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)));
      }),
  );
}

// Collects every POST (a Server Action call) from the moment it is called; the returned array grows live.
function recordPosts(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') {
      posts.push(request.url());
    }
  });
  return posts;
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

// §50 the search box shows the `/` shortcut as a hint (B10.3).
test.describe('§50 the search box shows the / hint', () => {
  test('AC-50.7: with JavaScript off the first response\'s box has placeholder "Press / to search" and shows it, milk + Enter opens exactly /?q=milk with [D]; hydrated, the hint shows on /, not after milk is typed, not on /?q=milk, and again after Escape (exactly /, 0 POSTs, [D, C])', async ({
    browser,
    baseURL,
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy milk' }, { title: 'Call mom', completed: true }]);
    const noScript = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const staticPage = await noScript.newPage();

    const firstResponse = await staticPage.goto('/');

    expect((await firstResponse?.text())?.includes(`placeholder="${HINT}"`)).toBe(true);
    await expect(searchBox(staticPage)).toHaveAttribute('placeholder', HINT);
    expect(await isPlaceholderShown(staticPage)).toBe(true);

    await searchBox(staticPage).fill('milk');
    await searchBox(staticPage).press('Enter');

    await expect(staticPage).toHaveURL(addressIs('/?q=milk'));
    await expect(rows(staticPage)).toHaveText(['Buy milk']);
    await noScript.close();

    const posts = recordPosts(page);
    await page.goto('/');
    await waitForHydration(page);

    expect(await isPlaceholderShown(page)).toBe(true);

    await page.keyboard.press('/');
    await page.keyboard.type('milk');

    await expect(searchBox(page)).toHaveValue('milk');
    expect(await isPlaceholderShown(page)).toBe(false);

    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(addressIs('/?q=milk'));
    await expect(rows(page)).toHaveText(['Buy milk']);
    expect(await isPlaceholderShown(page)).toBe(false);

    await waitForHydration(page);
    await searchBox(page).click();
    await page.keyboard.press('Escape');

    await expect(page).toHaveURL(addressIs('/'));
    await expect(rows(page)).toHaveText(['Buy milk', 'Call mom']);
    await expect(searchBox(page)).toHaveValue('');
    await expect.poll(() => isPlaceholderShown(page)).toBe(true);
    expect(posts).toEqual([]);
  });
});
