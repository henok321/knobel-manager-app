import { test, expect } from '@playwright/test';

test.describe('Knobel Manager App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login or show homepage
    await expect(page).toHaveURL(/\/(login)?/);
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
