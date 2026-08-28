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
