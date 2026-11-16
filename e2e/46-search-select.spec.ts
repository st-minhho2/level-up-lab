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

// §25 listens from an effect, so `/` does nothing before hydration. Waits until the network is idle, React has
// attached its fiber to the search box, and two frames plus a task have passed, so the passive effects have run.
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

interface FocusState {
  readonly activeIsBox: boolean;
  readonly selectionStart: number | null;
  readonly selectionEnd: number | null;
}

// Reads, in the page, whether "Search todos" is document.activeElement and its selection.
async function readFocusState(page: Page): Promise<FocusState> {
  return searchBox(page).evaluate((box) => {
    if (!(box instanceof HTMLInputElement)) {
      throw new Error('"Search todos" is not an <input>');
    }
    return {
      activeIsBox: document.activeElement === box,
      selectionStart: box.selectionStart,
      selectionEnd: box.selectionEnd,
    };
  });
}

// §46 the slash key also selects the text already in the search box (B9.3).
test.describe('§46 the slash key selects the search text', () => {
  test('AC-46.6: on /?q=milk, / makes "Search todos" active with selection 0 to 4, value milk, the address exactly /?q=milk and 0 POSTs; typing mom leaves exactly mom; Enter opens /?q=mom with rows [Call mom]', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy milk' }, { title: 'Call mom', completed: true }]);
    const posts = recordPosts(page);
    await page.goto('/?q=milk');
    await waitForHydration(page);
    await expect(searchBox(page)).toHaveValue('milk');
    await expect(searchBox(page)).not.toBeFocused();

    await page.keyboard.press('/');

    expect(await readFocusState(page)).toEqual({ activeIsBox: true, selectionStart: 0, selectionEnd: 4 });
    await expect(searchBox(page)).toHaveValue('milk');
    await expect(page).toHaveURL(addressIs('/?q=milk'));
    expect(posts).toEqual([]);

    await page.keyboard.type('mom');

    await expect(searchBox(page)).toHaveValue('mom');

    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(addressIs('/?q=mom'));
    await expect(page.getByRole('listitem')).toHaveText(['Call mom']);
  });
});
