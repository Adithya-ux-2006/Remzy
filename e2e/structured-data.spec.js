import { test, expect } from '@playwright/test';

test.describe('Structured Data — JSON-LD Validation', () => {
  let jsonLd;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const raw = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script?.textContent || null;
    });

    expect(raw, 'JSON-LD script tag not found').toBeTruthy();
    jsonLd = JSON.parse(raw);
  });

  test('has valid @context and @type', async () => {
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('WebApplication');
  });

  test('has required WebApplication fields', async () => {
    expect(jsonLd.name, 'name is required').toBeTruthy();
    expect(typeof jsonLd.name).toBe('string');

    expect(jsonLd.url, 'url is required').toBeTruthy();
    expect(jsonLd.url).toMatch(/^https?:\/\//);

    expect(jsonLd.description, 'description is required').toBeTruthy();
    expect(typeof jsonLd.description).toBe('string');
    expect(jsonLd.description.length).toBeGreaterThan(10);
  });

  test('has valid applicationCategory', async () => {
    expect(jsonLd.applicationCategory).toBe('HealthApplication');
  });

  test('has valid offers (free)', async () => {
    expect(jsonLd.offers).toBeTruthy();
    expect(jsonLd.offers['@type']).toBe('Offer');
    expect(jsonLd.offers.price).toBe('0');
    expect(jsonLd.offers.priceCurrency).toBe('USD');
  });

  test('has featureList with at least 3 items', async () => {
    expect(Array.isArray(jsonLd.featureList)).toBe(true);
    expect(jsonLd.featureList.length).toBeGreaterThanOrEqual(3);
    jsonLd.featureList.forEach((feature) => {
      expect(typeof feature).toBe('string');
      expect(feature.length).toBeGreaterThan(0);
    });
  });

  test('has author organization', async () => {
    expect(jsonLd.author).toBeTruthy();
    expect(jsonLd.author['@type']).toBe('Organization');
    expect(jsonLd.author.name).toBeTruthy();
  });

  test('url points to production domain', async () => {
    expect(jsonLd.url).toBe('https://remzyy.netlify.app');
  });

  test('no student-specific language in structured data', async () => {
    const serialized = JSON.stringify(jsonLd).toLowerCase();
    expect(serialized).not.toContain('student');
  });
});
