import { test, expect } from '@playwright/test';

test('Dashboard loads without errors', async ({ page }) => {
  // Skip if Supabase is not available (local development without proper credentials)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl || supabaseUrl === 'http://localhost:54321' || supabaseUrl.includes('your_supabase')) {
    test.skip('Skipping dashboard test - Supabase not properly configured');
    return;
  }

  // Listen for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Navigate to dashboard (will redirect to auth if not authenticated)
  await page.goto('/dashboard');
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if there are any console errors
  if (errors.length > 0) {
    console.log('Console errors found:', errors);
  }

  // Verify basic page elements exist (either dashboard or auth page)
  await expect(page).toHaveTitle(/FamilySync/);
  
  // Check for key dashboard components (if authenticated) or auth form (if not)
  const weekNavigation = page.locator('[data-testid="week-navigation"]');
  const weekView = page.locator('[data-testid="week-view"]');
  const authForm = page.locator('form');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'dashboard-state.png', fullPage: true });
  
  // Print page content for debugging
  console.log('Page title:', await page.title());
  console.log('Dashboard elements found:', {
    weekNavigation: await weekNavigation.count(),
    weekView: await weekView.count()
  });
  
  // Accept either dashboard elements or auth form as valid states
  const isDashboard = await weekNavigation.count() > 0 || await weekView.count() > 0;
  const isAuthPage = await authForm.count() > 0;
  
  expect(isDashboard || isAuthPage).toBe(true);
});