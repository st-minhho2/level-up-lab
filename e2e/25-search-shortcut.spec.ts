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

function searchBox(page: Page): Locator {
  return page.getByRole('search').getByRole('searchbox', { name: 'Search todos' });
}

function newTodoBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'New todo' });
}

function filterLink(page: Page, name: 'All' | 'Active' | 'Completed'): Locator {
  return page.getByRole('navigation', { name: 'Filter todos' }).getByRole('link', { name, exact: true });
}

// §25 listens from an effect, so `/` does nothing before hydration (advice: dropped behavior). Waits until the network
// is idle, React has attached its fiber to the search box (hydration reached it), and two frames plus a task have
// passed, so the passive effects of that commit have run before the first key.
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

// §25 the slash key focuses the search box (B5.3).
test.describe('§25 the slash key focuses the search box', () => {
  test('AC-25.6: the first / focuses an empty "Search todos" on exactly / with 0 POSTs; milk + Enter opens /?q=milk with [D] and the box reads milk; in "New todo" / is typed and focus stays; on /?filter=active Ctrl+/ leaves "Search todos" unfocused and a plain / then focuses it', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy milk' }, { title: 'Call mom', completed: true }]);
    const posts = recordPosts(page);
    await page.goto('/');
    await waitForHydration(page);
    await expect(searchBox(page)).not.toBeFocused();

    await page.keyboard.press('/');

    await expect(searchBox(page)).toBeFocused();
    await expect(searchBox(page)).toHaveValue('');
    await expect(page).toHaveURL(addressIs('/'));
    expect(posts).toEqual([]);

    await page.keyboard.type('milk');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(addressIs('/?q=milk'));
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk']);
    await expect(searchBox(page)).toHaveValue('milk');
    await waitForHydration(page);

    await newTodoBox(page).click();
    await page.keyboard.press('/');

    await expect(newTodoBox(page)).toHaveValue('/');
    await expect(newTodoBox(page)).toBeFocused();
    await expect(searchBox(page)).not.toBeFocused();

    await filterLink(page, 'Active').click();
    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await waitForHydration(page);
    await page.keyboard.press('Control+/');

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(searchBox(page)).not.toBeFocused();

    await page.keyboard.press('/');

    await expect(searchBox(page)).toBeFocused();
    await expect(searchBox(page)).toHaveValue('');
    expect(posts).toEqual([]);
  });
});
