import { expect, test, type ElementHandle, type Page } from '@playwright/test';
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

interface StatusState {
  readonly connected: boolean;
  readonly text: string | null;
  readonly childNodes: number;
}

// The browser's own local calendar day and its neighbours (§23 REQ-23.1, §17 REQ-17.1), read in the page.
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

// Waits for hydration, so the count's effect has run and a click goes through the Server Action.
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

async function reloadHydrated(page: Page): Promise<void> {
  await page.reload();
  await page.waitForLoadState('networkidle');
}

// Counts every document navigation of the main frame from now on; a Server Action is a fetch and never counts.
function watchNavigations(page: Page): () => number {
  let navigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigations += 1;
    }
  });
  return () => navigations;
}

// Our status element: among every role `status`, the ones the `N items left` paragraph precedes in document order
// (FOLLOWING) without containing it (not CONTAINS), as e2e/23-overdue-count.spec.ts. Never "the only status".
async function overdueStatuses(page: Page): Promise<ElementHandle<Node>[]> {
  const remaining = page.getByRole('paragraph').filter({ hasText: /^\d+ items? left$/ });
  await expect(remaining).toHaveCount(1);
  const paragraph = await remaining.elementHandle();
  const statuses = await page.getByRole('status').elementHandles();
  const following: ElementHandle<Node>[] = [];
  for (const status of statuses) {
    const follows = await status.evaluate((node, before) => {
      if (before === null) {
        return false;
      }
      const position = before.compareDocumentPosition(node);
      return (
        (position & Node.DOCUMENT_POSITION_FOLLOWING) === Node.DOCUMENT_POSITION_FOLLOWING &&
        (position & Node.DOCUMENT_POSITION_CONTAINS) === 0
      );
    }, paragraph);
    if (follows) {
      following.push(status);
    }
  }
  return following;
}

async function stateOf(handle: ElementHandle<Node>): Promise<StatusState> {
  return handle.evaluate((node) => ({
    connected: node.isConnected,
    text: node.textContent,
    childNodes: node.childNodes.length,
  }));
}

test.describe('§33 overdue count announced', () => {
  test('AC-33.5: the status element after the "N items left" paragraph exists once reading "2 overdue" after load; the same attached node reads "1 overdue" after ticking A, "" with no child node after ticking F, "2 overdue" after unticking both, with 0 navigations', async ({
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

    const afterLoad = await overdueStatuses(page);
    expect(afterLoad).toHaveLength(1);
    const [status] = afterLoad;
    if (status === undefined) {
      throw new Error('no status element follows the "N items left" paragraph');
    }
    expect(await stateOf(status)).toEqual({ connected: true, text: '2 overdue', childNodes: 1 });

    await checkboxA.click();

    await expect(checkboxA).toBeChecked();
    await expect.poll(() => stateOf(status)).toEqual({ connected: true, text: '1 overdue', childNodes: 1 });

    await checkboxF.click();

    await expect(checkboxF).toBeChecked();
    await expect.poll(() => stateOf(status)).toEqual({ connected: true, text: '', childNodes: 0 });

    await checkboxA.click();
    await checkboxF.click();

    await expect(checkboxA).not.toBeChecked();
    await expect(checkboxF).not.toBeChecked();
    await expect.poll(() => stateOf(status)).toEqual({ connected: true, text: '2 overdue', childNodes: 1 });
    expect(navigations()).toBe(0);

    await reloadHydrated(page);

    const afterReload = await overdueStatuses(page);
    expect(afterReload).toHaveLength(1);
    expect(await stateOf(afterReload[0] ?? status)).toEqual({ connected: true, text: '2 overdue', childNodes: 1 });
  });
});
