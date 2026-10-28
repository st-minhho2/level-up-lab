import { expect, test } from '@playwright/test';

// Infrastructure smoke test: proves the server boots in CI and locally. Section e2e files are named after their
// spec section (e2e/<nn>-<slug>.spec.ts) and cite AC-§.n ids in their titles.
test('GET /api/health answers 200 with status ok', async ({ request }) => {
  const response = await request.get('/api/health');

  expect(response.status()).toBe(200);
  const body = (await response.json()) as { status: string };
  expect(body.status).toBe('ok');
});

test('home page renders the lab title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Todos');
});
