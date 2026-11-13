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

// A row in edit mode renders its own <form>; scope to the one holding the "New todo" box.
function counter(page: Page): Locator {
  return page
    .locator('form')
    .filter({ has: newTodoBox(page) })
    .getByText(/^\d+ \/ 200$/);
}

// The box's key handler is attached by React, so Escape does nothing new before hydration. Waits until the network
// is idle, React has attached its fiber to the box, and two frames plus a task have passed.
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

// Collects every POST from the moment it is called; the returned array grows live.
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

// §29 Escape clears the new-todo title (B6.1).
test.describe('§29 Escape clears the new-todo title', () => {
  test('AC-29.7: Escape after typing Buy eggs leaves an empty box, "0 / 200", rows [B, A], the address / and 0 POSTs; then Call mom and Enter give rows [Call mom, B, A] with Call mom the only new row, also after a reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Walk the dog' }, { title: 'Buy milk' }]);
    await page.goto('/');
    await waitForHydration(page);
    await expect(rows(page)).toHaveText(['Walk the dog', 'Buy milk']);
    const posts = recordPosts(page);
    await newTodoBox(page).click();
    await page.keyboard.type('Buy eggs');
    await expect(newTodoBox(page)).toHaveValue('Buy eggs');

    await page.keyboard.press('Escape');

    await expect(newTodoBox(page)).toHaveValue('');
    await expect(counter(page)).toHaveText('0 / 200');
    await expect(rows(page)).toHaveText(['Walk the dog', 'Buy milk']);
    await expect(page).toHaveURL(addressIs('/'));
    await page.waitForLoadState('networkidle');
    expect(posts).toEqual([]);

    await page.keyboard.type('Call mom');
    await page.keyboard.press('Enter');

    await expect(rows(page)).toHaveText(['Call mom', 'Walk the dog', 'Buy milk']);
    const stored = await prisma.todo.findMany({ select: { title: true }, orderBy: { createdAt: 'desc' } });
    expect(stored.map((todo) => todo.title)).toEqual(['Call mom', 'Walk the dog', 'Buy milk']);

    await page.reload();

    await expect(rows(page)).toHaveText(['Call mom', 'Walk the dog', 'Buy milk']);
  });
});
