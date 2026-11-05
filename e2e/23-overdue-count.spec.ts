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
  readonly threeDaysAgo: string;
  readonly yesterday: string;
  readonly today: string;
  readonly tomorrow: string;
}

// The browser's own local calendar day and its neighbours (§23 REQ-23.1, §17 REQ-17.1), read from `new Date()` local
// fields in the page, never from the test runner's clock or literals.
async function browserDays(page: Page): Promise<Days> {
  return page.evaluate(() => {
    const now = new Date();
    const dayOf = (offset: number): string => {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
      const pad = (value: number): string => String(value).padStart(2, '0');
      return `${String(day.getFullYear()).padStart(4, '0')}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
    };
    return { threeDaysAgo: dayOf(-3), yesterday: dayOf(-1), today: dayOf(0), tomorrow: dayOf(1) };
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

// Opens `path` and waits for the client to hydrate, so the count's effect has run and a click goes through the
// Server Action (a fetch), not a native form POST.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

async function reloadHydrated(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// REQ-23.4 "without a full reload": counts every document navigation of the main frame from now on. A Server Action
// is a fetch and never counts; a native form POST, a reload or a link to another page does.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// Exact match: §17's row marker reads `Overdue` and never matches `N overdue`.
function overdueCount(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true });
}

async function expectOneCount(page: Page, text: string): Promise<void> {
  await expect(overdueCount(page, text)).toHaveCount(1);
  await expect(overdueCount(page, text)).toBeVisible();
}

// The row is addressed by its checkbox's accessible name (the title), which no edit here changes.
function rowOf(page: Page, title: string): Locator {
  return page.getByRole('listitem').filter({ has: page.getByRole('checkbox', { name: title, exact: true }) });
}

async function submitDueDate(page: Page, title: string, value: string): Promise<void> {
  const row = rowOf(page, title);
  await row.getByRole('button', { name: 'Edit due date' }).click();
  await row.getByLabel('Due date', { exact: true }).fill(value);
  await row.getByRole('button', { name: 'Update due date' }).click();
}

test.describe('§23 overdue count', () => {
  test('AC-23.7: one "2 overdue" after load, after the "N items left" paragraph and in no listitem; "1 overdue" after ticking A, "2 overdue" after unticking with 0 navigations; "1 overdue" after A is due today, on /?filter=completed, on /?q=zzz and after a reload; no "N overdue" once F is ticked', async ({
    page,
  }) => {
    await page.goto('/api/health');
    const days = await browserDays(page);
    await seedInDisplayOrder([
      { title: 'F', dueDate: days.threeDaysAgo },
      { title: 'E' },
      { title: 'D', dueDate: days.tomorrow },
      { title: 'C', dueDate: days.today },
      { title: 'B', completed: true, dueDate: days.yesterday },
      { title: 'A', dueDate: days.yesterday },
    ]);
    const checkboxA = page.getByRole('checkbox', { name: 'A', exact: true });
    const checkboxF = page.getByRole('checkbox', { name: 'F', exact: true });

    await openHydrated(page, '/');
    const navigations = watchNavigations(page);

    await expectOneCount(page, '2 overdue');
    const remaining = page.getByRole('paragraph').filter({ hasText: /^\d+ items? left$/ });
    await expect(remaining).toHaveCount(1);
    const remainingHandle = await remaining.elementHandle();
    const placement = await overdueCount(page, '2 overdue').evaluate(
      (node, paragraph) => ({
        afterParagraph:
          paragraph !== null &&
          (paragraph.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) ===
            Node.DOCUMENT_POSITION_FOLLOWING,
        inListItem: node.closest('li, [role="listitem"]') !== null,
      }),
      remainingHandle,
    );
    expect(placement).toEqual({ afterParagraph: true, inListItem: false });

    await checkboxA.click();

    await expect(checkboxA).toBeChecked();
    await expectOneCount(page, '1 overdue');

    await checkboxA.click();

    await expect(checkboxA).not.toBeChecked();
    await expectOneCount(page, '2 overdue');
    expect(navigations()).toBe(0);

    await submitDueDate(page, 'A', days.today);

    await expectOneCount(page, '1 overdue');

    await openHydrated(page, '/?filter=completed');

    await expectOneCount(page, '1 overdue');

    await openHydrated(page, '/?q=zzz');

    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expectOneCount(page, '1 overdue');

    await openHydrated(page, '/');
    await reloadHydrated(page);

    await expectOneCount(page, '1 overdue');

    await checkboxF.click();

    await expect(checkboxF).toBeChecked();
    await expect(page.getByText(/^\d+ overdue$/)).toHaveCount(0);
  });
});
