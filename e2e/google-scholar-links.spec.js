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

  test('research and non-research remedies are labelled as separate evidence tracks', async ({ page }) => {
    await page.goto('/results?symptom=eye_strain');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('20-20-20 Screen Reset', { exact: true })).toBeVisible();

    await page.goto('/remedy/rem_es01');
    await expect(page.locator('a[href="https://pubmed.ncbi.nlm.nih.gov/35963776/"]')).toBeVisible();

    await page.goto('/results?symptom=eye_strain');
    await expect(page.getByText('Brief Eyes-Closed Rest', { exact: true })).toBeVisible();
    await expect(page.getByText('Supportive Care').first()).toBeVisible();

    await page.goto('/results?symptom=bloating');
    await expect(page.getByText('Peppermint Bloating Tea', { exact: true })).toBeVisible();
    await expect(page.getByText('Traditional Use').first()).toBeVisible();
  });
});
