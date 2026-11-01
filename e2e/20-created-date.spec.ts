import { expect, test, type Locator, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Runs against the compose Postgres in this worktree's schema (DATABASE_URL from .env via playwright.config.ts).
const prisma = new PrismaClient();

// UTC+14: every stored instant below falls on a later local day than its UTC day for C and A, so a browser-local
// day would show Nov 4, Nov 2, Nov 2 instead of the UTC days §20 promises.
test.use({ timezoneId: 'Pacific/Kiritimati' });

test.beforeEach(async () => {
  await prisma.todo.deleteMany();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

const CREATED = ['Created 2026-11-03', 'Created 2026-11-02', 'Created 2026-11-01'] as const;

// AC-20.6's rows in list order C, B, A; createdAt is explicit because both the order and the shown day depend on it.
async function seedCba(): Promise<void> {
  for (const [title, createdAt] of [
    ['C', new Date(Date.UTC(2026, 10, 3, 23, 30))],
    ['B', new Date(Date.UTC(2026, 10, 2, 0, 30))],
    ['A', new Date(Date.UTC(2026, 10, 1, 12, 0))],
  ] as const) {
    await prisma.todo.create({ data: { title, createdAt } });
  }
}

// Opens `path` and waits for the client to hydrate, so a click goes through the Server Action (a fetch), not a native
// form POST.
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

function createdTimes(page: Page): Locator {
  return page.getByRole('listitem').locator('time');
}

interface ShownDate {
  readonly created: string | null;
  readonly boxed: boolean;
  readonly after: string;
}

// Each row's <time>: its data-created, whether its box is at least 1 px by 1 px, and its ::after content with the
// surrounding quotes removed (REQ-20.4: the wording is generated content, so this is what the person sees).
async function shownDates(page: Page): Promise<ShownDate[]> {
  return createdTimes(page).evaluateAll((times) =>
    times.map((time) => {
      const box = time.getBoundingClientRect();
      const content = getComputedStyle(time, '::after').content;
      return {
        created: time.getAttribute('data-created'),
        boxed: box.width >= 1 && box.height >= 1,
        after: content.replace(/^"(.*)"$/, '$1'),
      };
    }),
  );
}

async function expectDatesShown(page: Page): Promise<void> {
  await expect
    .poll(() => shownDates(page))
    .toEqual(CREATED.map((created) => ({ created, boxed: true, after: created })));
}

// "the three dates unchanged after each step, and 3 rows throughout".
async function expectDatesUnchanged(page: Page): Promise<void> {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect
    .poll(() => createdTimes(page).evaluateAll((times) => times.map((time) => time.getAttribute('data-created'))))
    .toEqual([...CREATED]);
}

test.describe('§20 show the creation date', () => {
  test('AC-20.6: rows C, B, A show Created 2026-11-03, 2026-11-02, 2026-11-01 as a visible ::after at load and after a reload in a Pacific/Kiritimati browser, unchanged after ticking B, renaming it B2 and setting its due date 2026-11-05, with [C, B, A] then [C, B2, A] and 3 rows throughout', async ({
    page,
  }) => {
    await seedCba();

    await openHydrated(page, '/');

    await expect(page.getByRole('listitem')).toHaveText(['C', 'B', 'A']);
    await expectDatesShown(page);
    await expectDatesUnchanged(page);

    await page.getByRole('checkbox', { name: 'B', exact: true }).click();

    await expect(page.getByRole('checkbox', { name: 'B', exact: true })).toBeChecked();
    await expectDatesUnchanged(page);

    await rowAt(page, 1).getByRole('button', { name: 'Edit title' }).click();
    await rowAt(page, 1).getByRole('textbox', { name: 'Edit title' }).fill('B2');
    await rowAt(page, 1).getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('listitem')).toHaveText(['C', 'B2', 'A']);
    await expectDatesUnchanged(page);

    await rowAt(page, 1).getByRole('button', { name: 'Edit due date' }).click();
    await rowAt(page, 1).getByLabel('Due date', { exact: true }).fill('2026-11-05');
    await rowAt(page, 1).getByRole('button', { name: 'Update due date' }).click();

    await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B2\s*Due 2026-11-05\s*$/, 'A']);
    await expectDatesUnchanged(page);

    await reloadHydrated(page);

    await expect(page.getByRole('listitem')).toHaveText(['C', /^\s*B2\s*Due 2026-11-05\s*$/, 'A']);
    await expectDatesShown(page);
    await expectDatesUnchanged(page);
  });
});
