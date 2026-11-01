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

// The browser's own local calendar day and its neighbours (REQ-17.1), read from `new Date()` local fields in the page,
// never from the test runner's clock or literals.
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

function overdueInList(page: Page): Locator {
  return page.getByRole('listitem').getByText('Overdue', { exact: true });
}

async function submitDueDate(page: Page, index: number, value: string): Promise<void> {
  const row = rowAt(page, index);
  await row.getByRole('button', { name: 'Edit due date' }).click();
  await row.getByLabel('Due date', { exact: true }).fill(value);
  await row.getByRole('button', { name: 'Update due date' }).click();
}

function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "the list reads [E, D, C, B, A] (5 rows, same order) and B's checkbox stays checked; B's row text reads `B` followed
// by `Due <yesterday>` with no `Overdue`"; A's row reads `A`, `Due <aDue>` and `Overdue` exactly when `aOverdue`.
async function expectRows(page: Page, days: Days, aDue: string, aOverdue: boolean): Promise<void> {
  const due = (title: string, day: string, overdue = false): RegExp =>
    new RegExp(`^\\s*${title}\\s*Due ${escaped(day)}\\s*${overdue ? 'Overdue\\s*' : ''}$`);
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await expect(page.getByRole('listitem')).toHaveText([
    /^\s*E\s*$/,
    due('D', days.tomorrow),
    due('C', days.today),
    due('B', days.yesterday),
    due('A', aDue, aOverdue),
  ]);
  await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
}

test.describe('§17 mark overdue todos', () => {
  test('AC-17.7: only open A, due yesterday, shows Overdue in its row; ticking hides it, unticking shows it again without a reload, and due today it shows none before and after a reload, with [E, D, C, B, A] and B checked throughout', async ({
    page,
  }) => {
    await page.goto('/api/health');
    const days = await browserDays(page);
    await seedInDisplayOrder([
      { title: 'E' },
      { title: 'D', dueDate: days.tomorrow },
      { title: 'C', dueDate: days.today },
      { title: 'B', completed: true, dueDate: days.yesterday },
      { title: 'A', dueDate: days.yesterday },
    ]);
    const checkboxA = page.getByRole('checkbox', { name: 'A', exact: true });

    await openHydrated(page, '/');

    await expect(overdueInList(page)).toHaveCount(1);
    await expect(rowAt(page, 4).getByText('Overdue', { exact: true })).toBeVisible();
    await expectRows(page, days, days.yesterday, true);

    await checkboxA.click();

    await expect(checkboxA).toBeChecked();
    await expect(overdueInList(page)).toHaveCount(0);
    await expectRows(page, days, days.yesterday, false);

    await checkboxA.click();

    await expect(checkboxA).not.toBeChecked();
    await expect(overdueInList(page)).toHaveCount(1);
    await expect(rowAt(page, 4).getByText('Overdue', { exact: true })).toBeVisible();
    await expectRows(page, days, days.yesterday, true);

    await submitDueDate(page, 4, days.today);

    await expectRows(page, days, days.today, false);
    await expect(overdueInList(page)).toHaveCount(0);
    await reloadHydrated(page);
    await expectRows(page, days, days.today, false);
    await expect(overdueInList(page)).toHaveCount(0);
  });
});
