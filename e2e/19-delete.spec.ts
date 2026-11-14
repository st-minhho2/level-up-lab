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

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action, not a lost event.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// The <li> whose checkbox is named exactly `title` (§5: the title is the checkbox's accessible name).
function rowOf(page: Page, title: string): Locator {
  return page.getByRole('listitem').filter({ has: page.getByRole('checkbox', { name: title, exact: true }) });
}

function deleteButtonOf(page: Page, title: string): Locator {
  return rowOf(page, title).getByRole('button', { name: 'Delete todo', exact: true });
}

// REQ-19.3: each row holds exactly 1 button named "Delete todo" before its click.
async function clickDelete(page: Page, title: string): Promise<void> {
  await expect(deleteButtonOf(page, title)).toHaveCount(1);
  await deleteButtonOf(page, title).click();
}

// "The list reads [C, A] (2 rows, B absent), C's and A's checkboxes unchecked".
async function expectCAOnly(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('listitem')).toHaveText(['C', 'A']);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'C', exact: true })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'A', exact: true })).not.toBeChecked();
}

// "0 rows and the text "No todos yet" is visible".
async function expectEmpty(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('No todos yet')).toBeVisible();
}

// §19 delete a todo (B3.3).
test.describe('§19 delete a todo', () => {
  test('AC-19.7: C (open), B (done), A (open): deleting B leaves [C, A] unchecked before and after a reload; deleting C and A leaves 0 rows and "No todos yet" before and after a reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    // §35: every confirmation dialog is accepted.
    page.on('dialog', (dialog) => {
      void dialog.accept(); // settles inside Playwright; the assertions below wait for its effect
    });
    await openHydrated(page, '/');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);

    await clickDelete(page, 'B');

    await expectCAOnly(page);

    await page.reload();

    await expectCAOnly(page);

    await page.waitForLoadState('networkidle');
    await clickDelete(page, 'C');
    await expect(page.getByRole('listitem')).toHaveText(['A']);
    await clickDelete(page, 'A');

    await expectEmpty(page);

    await page.reload();

    await expectEmpty(page);
  });
});

// §35: the exact message of the confirmation, copied from REQ-35.1.
const CONFIRM_MESSAGE = 'Delete this todo? This cannot be undone.';

interface SeenDialog {
  readonly type: string;
  readonly message: string;
}

// Records every dialog the page opens. A listener present stops Playwright's auto-dismiss, so an unexpected second
// dialog stays open and fails the test instead of passing unseen.
function recordDialogs(page: Page): SeenDialog[] {
  const seen: SeenDialog[] = [];
  page.on('dialog', (dialog) => {
    seen.push({ type: dialog.type(), message: dialog.message() });
  });
  return seen;
}

// Registers the answer to the next dialog before the click (§35 "How tests drive the dialog").
function answerNextDialog(page: Page, answer: 'accept' | 'dismiss'): void {
  page.once('dialog', (dialog) => {
    // Settles inside Playwright; the assertions after the click wait for its effect.
    void (answer === 'accept' ? dialog.accept() : dialog.dismiss());
  });
}

// "The list reads [C, B, A] (3 rows) with B's checkbox checked and C's and A's unchecked".
async function expectCBA(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'C', exact: true })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'A', exact: true })).not.toBeChecked();
}

// §35 deleting a todo asks for confirmation first (B7.1).
test.describe('§35 delete asks for confirmation first', () => {
  test('AC-35.4: accepting the dialog "Delete this todo? This cannot be undone." on B leaves [C, A] before and after a reload; accepting it on C and on A leaves 0 rows and "No todos yet" before and after a reload', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    const dialogs = recordDialogs(page);
    await openHydrated(page, '/');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    const confirmOnce = { type: 'confirm', message: CONFIRM_MESSAGE };

    answerNextDialog(page, 'accept');
    await clickDelete(page, 'B');

    await expect.poll(() => dialogs.length).toBe(1);
    await expectCAOnly(page);
    expect(dialogs).toEqual([confirmOnce]);

    await page.reload();

    await expectCAOnly(page);

    await page.waitForLoadState('networkidle');
    answerNextDialog(page, 'accept');
    await clickDelete(page, 'C');
    await expect.poll(() => dialogs.length).toBe(2);
    await expect(page.getByRole('listitem')).toHaveText(['A']);
    answerNextDialog(page, 'accept');
    await clickDelete(page, 'A');

    await expect.poll(() => dialogs.length).toBe(3);
    await expectEmpty(page);
    expect(dialogs).toEqual([confirmOnce, confirmOnce, confirmOnce]);

    await page.reload();

    await expectEmpty(page);
  });

  test('AC-35.5: dismissing the one dialog on B leaves [C, B, A] with B checked before and after a reload, B\'s row holding exactly 1 button "Delete todo" and 0 alerts', async ({
    page,
  }) => {
    await seedInDisplayOrder([{ title: 'C' }, { title: 'B', completed: true }, { title: 'A' }]);
    const dialogs = recordDialogs(page);
    await openHydrated(page, '/');
    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);

    answerNextDialog(page, 'dismiss');
    await clickDelete(page, 'B');

    await expect.poll(() => dialogs.length).toBe(1);
    await page.waitForLoadState('networkidle');
    await expectCBA(page);
    await expect(deleteButtonOf(page, 'B')).toHaveCount(1);
    await expect(rowOf(page, 'B').getByRole('alert')).toHaveCount(0);
    expect(dialogs).toHaveLength(1);

    await page.reload();

    await expectCBA(page);
    await expect(deleteButtonOf(page, 'B')).toHaveCount(1);
    await expect(rowOf(page, 'B').getByRole('alert')).toHaveCount(0);
  });
});
