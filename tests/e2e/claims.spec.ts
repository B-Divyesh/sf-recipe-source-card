import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('@claim:demo-sandbox opens filled sample data, isolates changes, resets, and discards on exit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your real data')).toBeVisible();
  const name = page.getByLabel('Recipe name');
  await expect(name).toHaveValue('Lemon and sage roast potatoes');
  await name.fill('Friday lemon potatoes');
  await page.reload();
  await expect(name).toHaveValue('Friday lemon potatoes');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:recipe-source-card:draft']);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(name).toHaveValue('Lemon and sage roast potatoes');
  await page.getByRole('link', { name: 'Start for real' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:recipe-source-card:draft'))).toBeNull();
});

test('@claim:source-linked-exports downloads edited Markdown and JSON with the canonical source', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByLabel('Recipe name').fill('Crisp Friday potatoes');
  const markdownEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Markdown' }).click();
  const markdown = await markdownEvent;
  expect(markdown.suggestedFilename()).toBe('crisp-friday-potatoes.md');
  expect(await readFile(await markdown.path()!, 'utf8')).toContain('Source: https://recipes.example/lemon-sage-potatoes');
  const jsonEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const json = JSON.parse(await readFile(await (await jsonEvent).path()!, 'utf8')) as { name: string; sourceUrl: string };
  expect(json).toMatchObject({ name: 'Crisp Friday potatoes', sourceUrl: 'https://recipes.example/lemon-sage-potatoes' });
});

test('@claim:local-recipe-data keeps the whole demo flow same-origin and uses only demo storage', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url()); });
  await page.goto('/demo/');
  await page.getByLabel('Yield').fill('6 servings');
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  await event;
  expect(offOrigin).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage).every((key) => key.startsWith('demo:')))).toBe(true);
});

test('@claim:site-network-privacy loads public pages without third-party runtime requests', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url()); });
  for (const path of ['/', '/demo/', '/privacy/', '/terms/']) await page.goto(path);
  expect(offOrigin).toEqual([]);
});

test('@claim:structured-data-only builds the sample from Recipe JSON-LD and exposes its source', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Found in published Recipe JSON-LD')).toBeVisible();
  await expect(page.getByLabel('Author')).toHaveValue('Mara Bell');
  await expect(page.getByLabel('Ingredients, one per line')).toHaveValue(/700 g small potatoes/);
  await expect(page.locator('#demo-source-link')).toHaveText('recipes.example');
});

test('@claim:plus-terms presents the production $12 one-time library offer', async ({ page }) => {
  await page.goto('/');
  const plus = page.locator('#plus');
  await expect(plus).toContainText('$12');
  await expect(plus).toContainText('one-time purchase');
  await expect(plus).toContainText('Save cards on your device');
  await expect(plus).toContainText('Capture, editing, and both exports stay free');
  await expect(plus.getByRole('link', { name: 'Buy Source Card Plus' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/recipe-source-card/checkout');
});

test('@claim:offline-reload reloads the sample demo offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit a source-linked recipe card.');
  await expect(page.getByLabel('Recipe name')).toHaveValue('Lemon and sage roast potatoes');
  await context.setOffline(false);
});
