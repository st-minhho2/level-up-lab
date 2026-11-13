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

interface Days {
  readonly yesterday: string;
  readonly today: string;
  readonly tomorrow: string;
}

// The browser's own local calendar day and its neighbours (§17 REQ-17.1, §31 REQ-31.1), read from `new Date()` local
// fields in the page, never from the test runner's clock or literals.
async function browserDays(page: Page): Promise<Days> {
  return page.evaluate(() => {
    const now = new Date();
    const dayOf = (offset: number): string => {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
      const pad = (value: number): string => String(value).padStart(2, '0');
      return `${String(day.getFullYear()).padStart(4, '0')}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    };
    return { yesterday: dayOf(-1), today: dayOf(0), tomorrow: dayOf(1) };
  });
}

// Rows are given in display order: the list is `createdAt desc` (§5 REQ-5.1), so index 0 gets the newest createdAt.
// A due day is stored as the DATE column §15 writes (`YYYY-MM-DDT00:00:00.000Z`).
async function seedInDisplayOrder(
  rows: readonly { readonly title: string; readonly completed?: boolean; readonly dueDate?: string }[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    await prisma.todo.create({
      data: {
        title: row.title,
        completed: row.completed,
        createdAt: new Date(2026, 0, rows.length - index),
        dueDate: row.dueDate === undefined ? undefined : new Date(`${row.dueDate}T00:00:00.000Z`),
      },
    });
  }
}

// Opens `path` and waits for the client to hydrate, so the marker's effect has run and a click goes through the
// Server Action (a fetch), not a native form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

async function reloadHydrated(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// The row is addressed by position because its text and controls change while it is being edited.
function rowAt(page: Page, index: number): Locator {
  return page.getByRole('listitem').nth(index);
}

function dueTodayInList(page: Page): Locator {
  return page.getByRole('listitem').getByText('Due today', { exact: true });
}

function overdueInList(page: Page): Locator {
  return page.getByRole('listitem').getByText('Overdue', { exact: true });
}

// The titles of the rows holding a visible `Due today`, in list order.
async function rowsShowingDueToday(page: Page): Promise<string[]> {
  const titles = ['E', 'D', 'C', 'B', 'A'];
  const shown: string[] = [];
  for (const [index, title] of titles.entries()) {
    if (await rowAt(page, index).getByText('Due today', { exact: true }).isVisible()) {
      shown.push(title);
    }
  }
  return shown;
}

// "the list reads [E, D, C, B, A] (5 rows, same order)": each row's text starts with its title.
async function expectOrder(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await expect
    .poll(async () => (await page.getByRole('listitem').allTextContents()).map((text) => text.trim().charAt(0)))
    .toEqual(['E', 'D', 'C', 'B', 'A']);
}

async function submitDueDate(page: Page, index: number, value: string): Promise<void> {
  const row = rowAt(page, index);
  await row.getByRole('button', { name: 'Edit due date' }).click();
  await row.getByLabel('Due date', { exact: true }).fill(value);
  await row.getByRole('button', { name: 'Update due date' }).click();
}

test.describe('§31 say "Due today" on an open todo due today', () => {
  test('AC-31.6: after load exactly 1 "Due today", in C, and A shows Overdue; unticking B shows 2 (C, B), ticking it 1, without a reload; A due today shows 2 (C, A) and 0 Overdue before and after a reload; the list reads [E, D, C, B, A] throughout', async ({
    page,
  }) => {
    await page.goto('/api/health');
    const days = await browserDays(page);
    await seedInDisplayOrder([
      { title: 'E' },
      { title: 'D', dueDate: days.tomorrow },
      { title: 'C', dueDate: days.today },
      { title: 'B', completed: true, dueDate: days.today },
      { title: 'A', dueDate: days.yesterday },
    ]);
    const checkboxB = page.getByRole('checkbox', { name: 'B', exact: true });
    // A reload is a main-frame document request; the App Router's same-document `history.replaceState` after a
    // Server Action fires `framenavigated` but loads no document, so it is not counted.
    let navigations = 0;
    page.on('request', (request) => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) navigations += 1;
    });

    await openHydrated(page, '/');

    await expect(dueTodayInList(page)).toHaveCount(1);
    await expect(rowAt(page, 2).getByText('Due today', { exact: true })).toBeVisible();
    await expect.poll(() => rowsShowingDueToday(page)).toEqual(['C']);
    await expect(overdueInList(page)).toHaveCount(1);
    await expect(rowAt(page, 4).getByText('Overdue', { exact: true })).toBeVisible();
    await expectOrder(page);
    const navigationsAfterLoad = navigations;

    await checkboxB.click();

    await expect(checkboxB).not.toBeChecked();
    await expect(dueTodayInList(page)).toHaveCount(2);
    await expect.poll(() => rowsShowingDueToday(page)).toEqual(['C', 'B']);
    await expectOrder(page);

    await checkboxB.click();

    await expect(checkboxB).toBeChecked();
    await expect(dueTodayInList(page)).toHaveCount(1);
    await expect.poll(() => rowsShowingDueToday(page)).toEqual(['C']);
    await expectOrder(page);
    expect(navigations).toBe(navigationsAfterLoad);

    await submitDueDate(page, 4, days.today);

    await expect(rowAt(page, 4).getByText(`Due ${days.today}`, { exact: true })).toBeVisible();
    await expect(dueTodayInList(page)).toHaveCount(2);
    await expect.poll(() => rowsShowingDueToday(page)).toEqual(['C', 'A']);
    await expect(overdueInList(page)).toHaveCount(0);
    await expectOrder(page);
    await reloadHydrated(page);
    await expect(dueTodayInList(page)).toHaveCount(2);
    await expect.poll(() => rowsShowingDueToday(page)).toEqual(['C', 'A']);
    await expect(overdueInList(page)).toHaveCount(0);
    await expectOrder(page);
  });
});
