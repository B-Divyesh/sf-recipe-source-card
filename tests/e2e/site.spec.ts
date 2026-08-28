import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('landing page is complete and accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Recipe Source Card/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Download for Chrome' })).toBeVisible();
  const accessibility = await new AxeBuilder({ page: page as never }).analyze();
  expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
});

test('returned license is stored and removed from the address', async ({ page }) => {
  await page.goto('/?license=pilot-token');
  await expect.poll(() => page.url()).not.toContain('license=');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:recipe-source-card'))).toBe('pilot-token');
});

for (const path of ['/privacy/', '/terms/']) {
  test(`${path} has a single main heading`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}
