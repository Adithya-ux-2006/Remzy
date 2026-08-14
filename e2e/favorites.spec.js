import { test, expect } from '@playwright/test';

test.describe('Favorites — Remedy Card Heart Button', () => {

  test('heart button is visible on remedy cards in results page', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('headache');
    await page.waitForTimeout(1200);

    const seeAllBtn = page.getByRole('button', { name: /see all/i });
    await seeAllBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const heartButtons = page.locator('button[aria-label*="favorites"]');
    await expect(heartButtons.first()).toBeVisible({ timeout: 5000 });
    const count = await heartButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking heart on unauthenticated user redirects to register', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('headache');
    await page.waitForTimeout(1200);

    const seeAllBtn = page.getByRole('button', { name: /see all/i });
    await seeAllBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const heartBtn = page.locator('button[aria-label*="favorite" i]').first();
    await expect(heartBtn).toBeVisible({ timeout: 10000 });
    await heartBtn.click();

    await expect(page).toHaveURL(/\/register/);
  });

  test('heart button is visible on remedy detail page', async ({ page }) => {
    await page.goto('/remedy/rem_001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const heartBtn = page.locator('button[aria-label*="favorites"]').first();
    await expect(heartBtn).toBeVisible({ timeout: 10000 });
  });
});
