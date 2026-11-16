import { expect, test, type Page } from '@playwright/test';
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

// Opens `/` and waits for the client to hydrate, so the click reaches React's handler.
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

interface FocusState {
  readonly activeIsField: boolean;
  readonly selectionStart: number | null;
  readonly selectionEnd: number | null;
}

// Reads, in the page, whether the row's "Edit title" field is document.activeElement and its selection.
async function readFocusState(page: Page): Promise<FocusState> {
  return page
    .getByRole('listitem')
    .first()
    .getByRole('textbox', { name: 'Edit title' })
    .evaluate((field) => {
      if (!(field instanceof HTMLInputElement)) {
        throw new Error('the "Edit title" text box is not an <input>');
      }
      return {
        activeIsField: document.activeElement === field,
        selectionStart: field.selectionStart,
        selectionEnd: field.selectionEnd,
      };
    });
}

test.describe('§41 Opening the title editor selects the whole title', () => {
  test('AC-41.6: after the click the row\'s field is active with selection 0 to 7 and 0 POSTs; A keeps its title and 1 "Edit title"; after Z the value is "Z"; after Save B reads "Z"; after the reload the list reads [Z, Walk the dog]', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'Buy mik' }, { title: 'Walk the dog' }]);
    await openHydrated(page);
    await expect(page.getByRole('listitem')).toHaveText(['Buy mik', 'Walk the dog']);
    // Rows are addressed by position because B's text and controls change while it is being edited.
    const rowB = page.getByRole('listitem').nth(0);
    const rowA = page.getByRole('listitem').nth(1);
    const posts = recordPostsToRoot(page);

    await rowB.getByRole('button', { name: 'Edit title' }).click();

    const field = rowB.getByRole('textbox', { name: 'Edit title' });
    await expect(field).toBeVisible();
    expect(await readFocusState(page)).toEqual({ activeIsField: true, selectionStart: 0, selectionEnd: 7 });
    expect(posts).toEqual([]);
    await expect(rowA).toHaveText('Walk the dog');
    await expect(rowA.getByRole('button', { name: 'Edit title' })).toHaveCount(1);

    await page.keyboard.press('Z');

    await expect(field).toHaveValue('Z');

    await rowB.getByRole('button', { name: 'Save' }).click();

    await expect(rowB).toHaveText('Z');
    await page.reload();
    await expect(page.getByRole('listitem')).toHaveText(['Z', 'Walk the dog']);
  });
});
