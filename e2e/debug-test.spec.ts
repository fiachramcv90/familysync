import { test, expect } from '@playwright/test';

test('Debug dashboard works', async ({ page }) => {
  // Listen for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Navigate to debug page
  await page.goto('http://localhost:3000/debug');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check basic functionality
  await expect(page.locator('[data-testid="debug-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="week-navigation"]')).toBeVisible();
  await expect(page.locator('[data-testid="week-view"]')).toBeVisible();
  
  // Test interactivity
  const button = page.locator('button:has-text("Count:")');
  await button.click();
  await expect(button).toContainText('Count: 1');

  // Print any errors
  if (errors.length > 0) {
    console.log('Debug page errors:', errors);
  }

  console.log('Debug page loaded successfully with', errors.length, 'errors');
});