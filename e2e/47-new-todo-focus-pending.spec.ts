import { expect, test, type Locator, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL loaded by playwright.config.ts).
const prisma = new PrismaClient();

// How long each Server Action request is held back before it goes to the server (AC-47.5, AC-47.6).
const ACTION_HOLD_MS = 2000;

test.beforeEach(async () => {
  await prisma.todo.deleteMany();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

// Rows are given in display order: the list is `createdAt desc` (§5 REQ-5.1), so index 0 gets the newest createdAt.
// No due date is seeded, so a row's text is its title alone.
async function seedInDisplayOrder(rows: readonly { readonly title: string }[]): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

function rows(page: Page): Locator {
  return page.getByRole('listitem');
}

function newTodoBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'New todo' });
}

function addButton(page: Page): Locator {
  return page.getByRole('button', { name: 'Add' });
}

// The §25 search box, as `e2e/25-search-shortcut.spec.ts` names it.
function searchBox(page: Page): Locator {
  return page.getByRole('search').getByRole('searchbox', { name: 'Search todos' });
}

function isServerAction(method: string, headers: Record<string, string>): boolean {
  return method === 'POST' && headers['next-action'] !== undefined;
}

// Holds every Server Action request (a POST carrying the Next-Action header) back before it goes to the server, so
// the person can move focus while the save is pending; every other request goes through untouched.
async function holdServerActions(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (!isServerAction(request.method(), request.headers())) {
      await route.fallback();
      return;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ACTION_HOLD_MS);
    });
    await route.continue();
  });
}

// Collects every Server Action POST from the moment it is called; the returned array grows live.
function recordServerActions(page: Page): string[] {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (isServerAction(request.method(), request.headers())) {
      posts.push(request.url());
    }
  });
  return posts;
}

// The form's focus handling and the `/` shortcut are attached by React, so nothing is judged before hydration.
// Waits until the network is idle, React has attached its fiber to the box, and two frames plus a task have passed.
async function waitForHydration(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const box = document.getElementById('new-todo');
    return box !== null && Object.keys(box).some((name) => name.startsWith('__reactFiber'));
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)));
      }),
  );
}

// §47 a focus move during a pending add is kept (B9.4).
test.describe('§47 a focus move during a pending add is kept', () => {
  test('AC-47.5: the list reads [Fresh]; "Search todos" is focused with value milk; "New todo" has value "" and is not focused; the address is still /; exactly 1 Server Action POST was made', async ({
    page,
  }) => {
    await holdServerActions(page);
    await page.goto('/');
    await waitForHydration(page);
    const posts = recordServerActions(page);
    await newTodoBox(page).click();
    await page.keyboard.type('Fresh');

    await addButton(page).click();
    await page.keyboard.press('/');
    await page.keyboard.type('milk');
    await expect(rows(page)).toHaveText(['Fresh']);

    await expect(searchBox(page)).toBeFocused();
    await expect(searchBox(page)).toHaveValue('milk');
    await expect(newTodoBox(page)).toHaveValue('');
    await expect(newTodoBox(page)).not.toBeFocused();
    expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe('/');
    expect(posts).toHaveLength(1);
  });

  test('AC-47.6: the list holds 2 rows, the first reads Fresh; exactly 1 "Edit title" text box is shown, in the second row, focused and holding Buy milk; "New todo" has value "" and is not focused; exactly 1 Server Action POST was made', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy milk' }]);
    await holdServerActions(page);
    await page.goto('/');
    await waitForHydration(page);
    const posts = recordServerActions(page);
    await newTodoBox(page).click();
    await page.keyboard.type('Fresh');

    await addButton(page).click();
    await rows(page).filter({ hasText: 'Buy milk' }).getByRole('button', { name: 'Edit title' }).click();
    await expect(rows(page).first()).toHaveText('Fresh');

    await expect(rows(page)).toHaveCount(2);
    await expect(page.getByRole('textbox', { name: 'Edit title' })).toHaveCount(1);
    const editor = rows(page).nth(1).getByRole('textbox', { name: 'Edit title' });
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue('Buy milk');
    await expect(newTodoBox(page)).toHaveValue('');
    await expect(newTodoBox(page)).not.toBeFocused();
    expect(posts).toHaveLength(1);
  });
});
