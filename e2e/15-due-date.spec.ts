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
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: { title: row.title, completed: row.completed, createdAt: new Date(2026, 0, rows.length - index) },
    });
  }
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// Reloads and waits for hydration again, so the next click on a client control is handled.
async function reloadHydrated(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// The row is addressed by position because its text and controls change while it is being edited.
function rowAt(page: Page, index: number): Locator {
  return page.getByRole('listitem').nth(index);
}

async function submitDueDate(page: Page, index: number, value: string): Promise<void> {
  const row = rowAt(page, index);
  await row.getByRole('button', { name: 'Edit due date' }).click();
  await row.getByLabel('Due date', { exact: true }).fill(value);
  await row.getByRole('button', { name: 'Update due date' }).click();
}

// "B's row reads `B` followed by `Due 2026-11-05`, the list reads [C, B, A] (3 rows, same order), B's checkbox is still
// checked and C's and A's rows show no `Due` text".
async function expectBDueInOrder(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B\s*Due 2026-11-05\s*$/, 'A']);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
}

// "B's row shows no `Due` text and B's checkbox is still checked" (order and the other rows unchanged).
async function expectNoDueInOrder(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
}

test.describe('§15 an optional due date', () => {
  test("AC-15.7: B's due date 2026-11-05 shows in B's row before and after a reload with [C, B, A] and B checked; cleared, it shows no Due text before and after a reload", async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    await openHydrated(page, '/');
    await expectNoDueInOrder(page);

    await submitDueDate(page, 1, '2026-11-05');

    await expectBDueInOrder(page);
    await reloadHydrated(page);
    await expectBDueInOrder(page);

    await submitDueDate(page, 1, '');

    await expectNoDueInOrder(page);
    await reloadHydrated(page);
    await expectNoDueInOrder(page);
  });
});
