import AxeBuilder from '@axe-core/playwright';
import { chromium, expect, test } from '@playwright/test';

test('extension popup is accessible and explains a restricted-page error', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Extension smoke test runs once in desktop Chromium.');
  const extensionPath = new URL('../../.output/chrome-mv3/', import.meta.url).pathname;
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium',
    headless: true,
    acceptDownloads: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    let worker = context.serviceWorkers()[0];
    worker ??= await context.waitForEvent('serviceworker', { timeout: 10_000 });
    const extensionId = new URL(worker.url()).host;
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.locator('h1')).toHaveCount(1);
    const accessibility = await new AxeBuilder({ page: popup as never }).analyze();
    expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
    await popup.getByRole('button', { name: 'Capture recipe' }).click();
    await expect(popup.locator('#notice')).toContainText('Open a regular web recipe page');
  } finally {
    await context.close();
  }
});

test('@claim:plus-library saves, reopens, and removes a card with a cached valid license', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Extension claim runs once in desktop Chromium.');
  const extensionPath = new URL('../../.output/chrome-mv3/', import.meta.url).pathname;
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    let worker = context.serviceWorkers()[0];
    worker ??= await context.waitForEvent('serviceworker', { timeout: 10_000 });
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${new URL(worker.url()).host}/popup.html`);
    await popup.evaluate(async (now) => {
      const draft = {
        id: 'recipe-claim', name: 'Lemon potatoes', description: 'A sample.', author: 'Mara Bell', yield: '4 servings', prepTime: 'PT15M', cookTime: 'PT40M', totalTime: 'PT55M', ingredients: ['700 g potatoes'], instructions: ['Roast the potatoes.'], imageUrl: '', sourceUrl: 'https://recipes.example/lemon-potatoes', sourceSite: 'recipes.example', datePublished: '2026-07-12', capturedAt: '2026-08-28T09:00:00.000Z',
      };
      await chrome.storage.local.set({
        'recipe-source-card:draft': draft,
        'sb_license:recipe-source-card': 'cached-valid-token',
        'sb_license:recipe-source-card:verdict': { token: 'cached-valid-token', valid: true, checkedAt: now },
      });
    }, Date.now());
    await popup.reload();
    await expect(popup.locator('#license-state')).toContainText('Plus active');
    await popup.getByRole('button', { name: 'Save to local library' }).click();
    await expect(popup.locator('#library-count')).toHaveText('1 saved');
    await popup.locator('.library-open').click();
    await expect(popup.getByLabel('Recipe name')).toHaveValue('Lemon potatoes');
    await popup.getByRole('button', { name: 'Remove Lemon potatoes from library' }).click();
    await expect(popup.locator('#library-count')).toHaveText('0 saved');
  } finally {
    await context.close();
  }
});
