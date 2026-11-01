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

const ALL_ROWS = ['Buy milk', 'Milkshake', 'Call mom', 'Walk the dog'] as const;

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

// The §21 store: D "Buy milk" (open), C "Milkshake" (done), B "Call mom" (open), A "Walk the dog" (done).
async function seedFourTodos(): Promise<void> {
  await seedInDisplayOrder([
    { title: 'Buy milk' },
    { title: 'Milkshake', completed: true },
    { title: 'Call mom' },
    { title: 'Walk the dog', completed: true },
  ]);
}

async function storedTodos(): Promise<{ titles: string[]; completed: boolean[] }> {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
    select: { title: true, completed: true },
  });
  return { titles: todos.map((todo) => todo.title), completed: todos.map((todo) => todo.completed) };
}

function rows(page: Page): Locator {
  return page.getByRole('listitem');
}

function searchBox(page: Page): Locator {
  return page.getByRole('search').getByRole('searchbox', { name: 'Search todos' });
}

// Counted on the whole page, so a second "Clear search" link anywhere would show.
function clearLink(page: Page): Locator {
  return page.getByRole('link', { name: 'Clear search', exact: true });
}

function filterLink(page: Page, name: 'All' | 'Active' | 'Completed'): Locator {
  return page.getByRole('navigation', { name: 'Filter todos' }).getByRole('link', { name, exact: true });
}

function exactText(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

// Opens `path` and waits for the client to hydrate, so a click goes through the client router.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

// §21 clear the search (B4.2).
test.describe('§21 clear the search', () => {
  test('AC-21.5: on /?q=milk one link and [D, C]; the click opens exactly / with [D, C, B, A], an empty box and no link; /?filter=active&q=milk shows [D]; the click opens exactly /?filter=active with [D, B], an empty box, no link and "Active" current, and the same after a reload', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/?q=milk');
    await expect(clearLink(page)).toHaveCount(1);
    await expect(rows(page)).toHaveText(['Buy milk', 'Milkshake']);

    await clearLink(page).click();

    await expect(page).toHaveURL(addressIs('/'));
    await expect(rows(page)).toHaveText([...ALL_ROWS]);
    await expect(searchBox(page)).toHaveValue('');
    await expect(clearLink(page)).toHaveCount(0);

    await openHydrated(page, '/?filter=active&q=milk');

    await expect(rows(page)).toHaveText(['Buy milk']);

    await clearLink(page).click();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(rows(page)).toHaveText(['Buy milk', 'Call mom']);
    await expect(searchBox(page)).toHaveValue('');
    await expect(clearLink(page)).toHaveCount(0);
    await expect(filterLink(page, 'Active')).toHaveAttribute('aria-current', 'page');

    await page.reload();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(rows(page)).toHaveText(['Buy milk', 'Call mom']);
    await expect(searchBox(page)).toHaveValue('');
    await expect(clearLink(page)).toHaveCount(0);
    await expect(filterLink(page, 'Active')).toHaveAttribute('aria-current', 'page');
  });

  test('AC-21.6: on /?q=zzz 0 rows, one "No todos match your search", one link and one "2 items left"; the click opens / with [D, C, B, A], no "No todos match your search" and one "2 items left"; from /?filter=completed&q=zzz the click opens exactly /?filter=completed with [C, A]; /?q=%20%20 has no link', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/?q=zzz');
    await expect(rows(page)).toHaveCount(0);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(1);
    await expect(clearLink(page)).toHaveCount(1);
    await expect(exactText(page, '2 items left')).toHaveCount(1);

    await clearLink(page).click();

    await expect(page).toHaveURL(addressIs('/'));
    await expect(rows(page)).toHaveText([...ALL_ROWS]);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(0);
    await expect(exactText(page, '2 items left')).toHaveCount(1);

    await openHydrated(page, '/?filter=completed&q=zzz');
    await clearLink(page).click();

    await expect(page).toHaveURL(addressIs('/?filter=completed'));
    await expect(rows(page)).toHaveText(['Milkshake', 'Walk the dog']);

    await page.goto('/?q=%20%20');

    await expect(rows(page)).toHaveText([...ALL_ROWS]);
    await expect(clearLink(page)).toHaveCount(0);
  });

  test.describe('§21 clear the search with JavaScript disabled', () => {
    test.use({ javaScriptEnabled: false });

    test('AC-21.7: with JavaScript disabled, /?filter=completed&q=milk shows [C]; the click opens exactly /?filter=completed with [C, A], an empty box and no link; the store holds the same four titles and completed flags as before the click', async ({
      page,
    }) => {
      await seedFourTodos();
      await page.goto('/?filter=completed&q=milk');
      await expect(rows(page)).toHaveText(['Milkshake']);
      const before = await storedTodos();

      await clearLink(page).click();

      await expect(page).toHaveURL(addressIs('/?filter=completed'));
      await expect(rows(page)).toHaveText(['Milkshake', 'Walk the dog']);
      await expect(searchBox(page)).toHaveValue('');
      await expect(clearLink(page)).toHaveCount(0);
      const after = await storedTodos();
      expect(after).toEqual({ titles: [...ALL_ROWS], completed: [false, true, false, true] });
      expect(after).toEqual(before);
    });
  });
});
