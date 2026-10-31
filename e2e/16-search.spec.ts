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

// AC-16.6's store: D "Buy milk" (open), C "Milkshake" (done), B "Call mom" (open), A "Walk the dog" (done).
async function seedFourTodos(): Promise<void> {
  await seedInDisplayOrder([
    { title: 'Buy milk' },
    { title: 'Milkshake', completed: true },
    { title: 'Call mom' },
    { title: 'Walk the dog', completed: true },
  ]);
}

function searchForm(page: Page): Locator {
  return page.getByRole('search');
}

function searchBox(page: Page): Locator {
  return searchForm(page).getByRole('searchbox', { name: 'Search todos' });
}

function searchButton(page: Page): Locator {
  return searchForm(page).getByRole('button', { name: 'Search', exact: true });
}

function filterLink(page: Page, name: 'All' | 'Active' | 'Completed'): Locator {
  return page.getByRole('navigation', { name: 'Filter todos' }).getByRole('link', { name, exact: true });
}

function exactText(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action or the client router,
// not a native navigation.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// Types `query` into "Search todos" (replacing what it holds) and submits the native GET form.
async function search(page: Page, query: string): Promise<void> {
  await searchBox(page).fill(query);
  await searchButton(page).click();
  await page.waitForLoadState('networkidle');
}

// The address as path plus query, so the assertion does not depend on the worktree's PORT.
function addressIs(pathAndQuery: string): (url: URL) => boolean {
  return (url) => url.pathname + url.search === pathAndQuery;
}

// The address is `/` and carries these query parameters, in any order (the form decides the order).
function addressHas(params: Readonly<Record<string, string>>): (url: URL) => boolean {
  return (url) =>
    url.pathname === '/' && Object.entries(params).every(([key, value]) => url.searchParams.get(key) === value);
}

// The row is addressed by position because its text and controls change while it is being edited (as e2e/06).
async function retitle(page: Page, index: number, draft: string): Promise<void> {
  const row = page.getByRole('listitem').nth(index);
  await row.getByRole('button', { name: 'Edit title' }).click();
  await row.getByRole('textbox', { name: 'Edit title' }).fill(draft);
  await row.getByRole('button', { name: 'Save' }).click();
}

// §16 search by title (B2.5).
test.describe('§16 search by title', () => {
  test('AC-16.6: search narrows to [D, C], Active drops the search and shows [D, B] with an empty box, MILK under Active shows [D] and survives a reload, zzz shows exactly one "No todos match your search", and a blank q shows [D, C, B, A]', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/');
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk', 'Milkshake', 'Call mom', 'Walk the dog']);

    await search(page, 'milk');

    await expect(page).toHaveURL(addressIs('/?q=milk'));
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk', 'Milkshake']);

    await filterLink(page, 'Active').click();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk', 'Call mom']);
    await expect(searchBox(page)).toHaveValue('');

    await search(page, 'MILK');

    await expect(page).toHaveURL(addressHas({ filter: 'active', q: 'MILK' }));
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk']);

    await page.reload();

    await expect(page).toHaveURL(addressHas({ filter: 'active', q: 'MILK' }));
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk']);
    await expect(searchBox(page)).toHaveValue('MILK');

    await search(page, 'zzz');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(1);

    await page.goto('/?q=%20%20');

    await expect(page.getByRole('listitem')).toHaveText(['Buy milk', 'Milkshake', 'Call mom', 'Walk the dog']);
  });

  test('AC-16.7: on /?q=milk the hidden todos still count and enable both buttons, a retitled D leaves the list while "2 items left" and the address stay, and "Mark all complete" completes D, C and the hidden B', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy milk' }, { title: 'Call mom', completed: true }, { title: 'Walk dog' }]);
    await openHydrated(page, '/?q=milk');
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk']);
    await expect(exactText(page, '2 items left')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Mark all complete' })).toBeEnabled();

    await retitle(page, 0, 'Buy bread');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(1);
    await expect(exactText(page, '2 items left')).toHaveCount(1);
    await expect(page).toHaveURL(addressIs('/?q=milk'));

    await page.getByRole('button', { name: 'Mark all complete' }).click();

    await expect(exactText(page, '0 items left')).toHaveCount(1);
    await expect(page).toHaveURL(addressIs('/?q=milk'));
    await expect
      .poll(async () =>
        prisma.todo.findMany({ orderBy: { createdAt: 'desc' }, select: { title: true, completed: true } }),
      )
      .toEqual([
        { title: 'Buy bread', completed: true },
        { title: 'Call mom', completed: true },
        { title: 'Walk dog', completed: true },
      ]);
  });

  test('with nothing stored, /?q=milk shows exactly one "No todos yet" and the search form, no list item (REQ-16.8, REQ-16.1)', async ({
    page,
  }) => {
    await page.goto('/?q=milk');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(exactText(page, 'No todos yet')).toHaveCount(1);
    await expect(exactText(page, 'No todos match your search')).toHaveCount(0);
    await expect(searchForm(page)).toHaveCount(1);
    await expect(searchBox(page)).toHaveCount(1);
    await expect(searchButton(page)).toHaveCount(1);
  });

  test('searching from /?filter=completed keeps filter=completed in the address and lists the todos matching both (REQ-16.6)', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/?filter=completed');
    await expect(page.getByRole('listitem')).toHaveText(['Milkshake', 'Walk the dog']);

    await search(page, 'milk');

    await expect(page).toHaveURL(addressHas({ filter: 'completed', q: 'milk' }));
    await expect(page.getByRole('listitem')).toHaveText(['Milkshake']);
  });

  test('on /?q=milk, text typed but not submitted is dropped when "Active" is followed: the address is /?filter=active and the box is empty (REQ-16.2)', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/?q=milk');
    await expect(searchBox(page)).toHaveValue('milk');

    await searchBox(page).fill('bread');
    await filterLink(page, 'Active').click();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(searchBox(page)).toHaveValue('');
  });

  test('on /, text typed but not submitted is dropped when "Active" is followed: the address is /?filter=active, the list is [D, B] and the box is empty (REQ-16.2, REQ-16.7)', async ({
    page,
  }) => {
    await seedFourTodos();
    await openHydrated(page, '/');
    await expect(searchBox(page)).toHaveValue('');

    await searchBox(page).fill('bread');
    await filterLink(page, 'Active').click();

    await expect(page).toHaveURL(addressIs('/?filter=active'));
    await expect(page.getByRole('listitem')).toHaveText(['Buy milk', 'Call mom']);
    await expect(searchBox(page)).toHaveValue('');
  });
});
