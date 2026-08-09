import { test, expect } from '@playwright/test';

test.describe('citation-link guardrail', () => {
  test('remedy pages never render search-result URLs as evidence', async ({ page }) => {
    const remedyIds = ['rem_001', 'rem_030', 'rem_104', 'rem_i01'];
    const forbidden = /scholar\.google\.[^/]+\/scholar(?:[/?]|$)|pubmed\.ncbi\.nlm\.nih\.gov\/(?:\?|search)|webofscience\.com\/wos\/woscc\/(?:basic-search|search|summary)|[?&](?:q|query|term|as_q)=/i;

    for (const id of remedyIds) {
      await page.goto(`/remedy/${id}`);
      await page.waitForLoadState('networkidle');
      const evidenceLinks = await page.locator('a[href^="http"]').evaluateAll((links) => links.map((link) => link.href));
      expect(evidenceLinks.filter((href) => forbidden.test(href)), `${id} rendered a search URL`).toEqual([]);
    }
  });

  test('reviewed limited-evidence remedies remain visible and clearly labelled', async ({ page }) => {
    await page.goto('/results?symptom=eye_strain');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('20-20-20 Screen Reset', { exact: true })).toBeVisible();
    await expect(page.getByText('Limited Evidence').first()).toBeVisible();
  });
});
