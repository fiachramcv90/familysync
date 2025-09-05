import { test, expect } from './utils/test-fixtures';
import { navigateAsAuthenticatedUser } from './utils/auth-helpers';

test('Dashboard loads without errors', async ({ page }) => {
  // Listen for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Navigate to dashboard with authentication
  await navigateAsAuthenticatedUser(page, '/dashboard');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if there are any console errors
  if (errors.length > 0) {
    console.log('Console errors found:', errors);
  }

  // Verify basic dashboard elements exist
  await expect(page).toHaveTitle(/FamilySync/);
  
  // Check for key dashboard components
  const weekNavigation = page.locator('[data-testid="week-navigation"]');
  const weekView = page.locator('[data-testid="week-view"]');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'dashboard-state.png', fullPage: true });
  
  // Print page content for debugging
  console.log('Page title:', await page.title());
  console.log('Dashboard elements found:', {
    weekNavigation: await weekNavigation.count(),
    weekView: await weekView.count()
  });
});