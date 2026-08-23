import { test, expect } from '@playwright/test';

test('verify NEW deploy remedy detail and count', async ({ page }) => {
  test.setTimeout(120000);
  // Use the NEW deploy URL
  await page.goto('https://6a7ee17329866a8e2fe52802--remzyy.netlify.app', { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for page to fully load
  await page.waitForTimeout(3000);
  
  // Check the remedy count on landing page
  const remedyCountText = page.locator('text=/\\d+\\s*Remedies/i').first();
  await expect(remedyCountText).toBeVisible({ timeout: 10000 });
  const countText = await remedyCountText.textContent();
  console.log('Remedy count on landing:', countText);
  
  // Navigate to search page
  await page.goto('https://6a7ee17329866a8e2fe52802--remzyy.netlify.app/search', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Search for a symptom on search page
  const search = page.locator('input[placeholder*="Search" i], input[placeholder*="search" i], input[type="search"], textbox').first();
  await expect(search).toBeVisible({ timeout: 15000 });
  await search.fill('headache');
  await page.waitForTimeout(2000);
  
  // Click first remedy link directly (results are already shown on page)
  const firstCard = page.locator('a[href^="/remedy/"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });
  await firstCard.click();
  
  await page.waitForURL('**/remedy/**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Verify remedy detail page has key elements
  const title = page.locator('h1').first();
  await expect(title).toBeVisible({ timeout: 10000 });
  console.log('Remedy title:', await title.textContent());
  
  // Check for Supporting Information section
  const evidenceSection = page.locator('text=Supporting Information').first();
  await expect(evidenceSection).toBeVisible({ timeout: 10000 });
  
  // Check for citations
  const citations = page.locator('a[href*="pubmed"], a[href*="doi"], a[href*="europepmc"], a[href*="ncbi"]');
  const citationCount = await citations.count();
  console.log('Citations found:', citationCount);
  
  // Verify at least one citation exists
  expect(citationCount).toBeGreaterThan(0);
  
  // Screenshot for verification
  await page.screenshot({ path: 'new-deploy-remedy-detail.png', fullPage: true });
  console.log('Screenshot saved');
});