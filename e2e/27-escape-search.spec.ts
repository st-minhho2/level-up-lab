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

// Counted on the whole page, so a "Clear search" link anywhere would show.
function clearLink(page: Page): Locator {
  return page.getByRole('link', { name: 'Clear search', exact: true });
}

// The box's key handler is attached by React, so Escape does nothing new before hydration. Waits until the network
// is idle, React has attached its fiber to the search box, and two frames plus a task have passed.
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

// Collects every request matching `keep` from the moment it is called; the returned array grows live.
function recordRequests(page: Page, keep: (method: string) => boolean): string[] {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (keep(request.method())) {
      requests.push(`${request.method()} ${request.url()}`);
    }
  });
  return requests;
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

// §27 Escape clears the search box (B5.5).
test.describe('§27 Escape clears the search box', () => {
  test('AC-27.6: on /?filter=active&q=milk ([D]) Escape in "Search todos" opens exactly /?filter=active with an empty box, rows [D, B], no "Clear search" link and 0 POSTs; then /, zzz and Escape with no search in effect leave the address unchanged, the box empty and 0 requests', async ({
    page,
  }) => {
    await seedInDisplayOrder([
      { title: 'Buy milk' },
      { title: 'Call mom', completed: true },
      { title: 'Walk the dog' },
    ]);
    const posts = recordRequests(page, (method) => method === 'POST');
    await page.goto('/?filter=active&q=milk');
    await waitForHydration(page);
    await expect(rows(page)).toHaveText(['Buy milk']);
    await expect(clearLink(page)).toHaveCount(1);

    await searchBox(page).click();
    await page.keyboard.press('Escape');

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(searchBox(page)).toHaveValue('');
    await expect(rows(page)).toHaveText(['Buy milk', 'Walk the dog']);
    await expect(clearLink(page)).toHaveCount(0);
    expect(posts).toEqual([]);

    await waitForHydration(page);
    const requests = recordRequests(page, () => true);
    await page.keyboard.press('/');
    await expect(searchBox(page)).toBeFocused();
    await page.keyboard.type('zzz');
    await expect(searchBox(page)).toHaveValue('zzz');

    await page.keyboard.press('Escape');

    await expect(searchBox(page)).toHaveValue('');
    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(rows(page)).toHaveText(['Buy milk', 'Walk the dog']);
    await page.waitForLoadState('networkidle');
    expect(requests).toEqual([]);
    expect(posts).toEqual([]);
  });
});
