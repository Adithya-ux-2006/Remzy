import { test, expect } from '@playwright/test';

test('medical-centre search uses the same-origin API', async ({ browser }) => {
  const context = await browser.newContext({
    permissions: ['geolocation'],
    geolocation: { latitude: 12.9716, longitude: 77.5946 },
  });
  const page = await context.newPage();

  await page.route('**/api/nearby-medical-centres?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ elements: [{
        type: 'node', id: 123, lat: 12.972, lon: 77.595,
        tags: { name: 'Same Origin Clinic', amenity: 'clinic' },
      }] }),
    });
  });

  await page.goto('/remedy/rem_es01');
  await page.getByRole('button', { name: 'Find Nearby Medical Centres' }).click();

  const startedAt = Date.now();
  await page.getByRole('button', { name: 'Find Medical Centres Near Me' }).click();
  await expect(page.getByText('Same Origin Clinic')).toBeVisible();
  expect(Date.now() - startedAt).toBeLessThan(3000);

  await context.close();
});

test('medical-centre search explains when location permission is denied', async ({ browser }) => {
  const context = await browser.newContext({ geolocation: { latitude: 12.9716, longitude: 77.5946 } });
  const page = await context.newPage();

  await page.goto('/remedy/rem_es01');
  await page.getByRole('button', { name: 'Find Nearby Medical Centres' }).click();
  await page.getByRole('button', { name: 'Find Medical Centres Near Me' }).click();

  await expect(page.getByText('Location access was blocked')).toBeVisible();
  await expect(page.getByText(/search using your city or PIN code/i)).toBeVisible();
  await context.close();
});
