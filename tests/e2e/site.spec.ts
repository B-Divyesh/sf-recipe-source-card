import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/404/']) {
  test(`${path} has a complete accessible page`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Recipe Source Card/);
    const accessibility = await new AxeBuilder({ page: page as never }).analyze();
    expect(accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  });
}

test('landing first screen names the job, home cooks, and sample action', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Capture web recipes with their source.');
  await expect(page.getByText(/For home cooks/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toHaveAttribute('href', '/demo/');
});

test('404 page states the error plainly and offers working recovery links', async ({ page }) => {
  await page.goto('/404/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found.');
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('link', { name: 'Open sample demo' })).toHaveAttribute('href', '/demo/');
});

test('desktop keyboard navigation reaches the demo action with visible focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Keyboard order is checked once.');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  for (let count = 0; count < 9; count += 1) {
    if (await page.getByRole('link', { name: 'Try it with sample data' }).evaluate((node) => node === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  const demoLink = page.getByRole('link', { name: 'Try it with sample data' });
  await expect(demoLink).toBeFocused();
  expect(await demoLink.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo\/$/);
});

test('mobile pages have no horizontal overflow and use 44px controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/demo/']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  }
  const tooSmall = await page.locator('button, a').evaluateAll((nodes) => nodes.filter((node) => {
    const style = getComputedStyle(node); if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = node.getBoundingClientRect(); return rect.height < 44 && rect.width < 44;
  }).map((node) => node.textContent?.trim()));
  expect(tooSmall).toEqual([]);
});

test('returned license is stored and removed from the address', async ({ page }) => {
  await page.goto('/?license=production-token');
  await expect.poll(() => page.url()).not.toContain('license=');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:recipe-source-card'))).toBe('production-token');
});

test('reduced motion removes meaningful animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('.hero-copy').evaluate((node) => getComputedStyle(node).animationDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.001);
});
