import { test, expect } from '@playwright/test';

test.describe('Login Test with Demo User', () => {
  test('should login with demo user and diagnose issues', async ({ page }) => {
    console.log('=== TESTING LOGIN WITH DEMO USER ===');
    
    // Go to login page
    await page.goto('https://simple-todo-app-bmad.vercel.app/auth/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if login form is present
    console.log('Checking for login form elements...');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    
    // Verify form elements exist
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('Form elements found, filling in demo user credentials...');
    
    // Fill in the demo user credentials
    await emailInput.fill('demo@familysync.app');
    await passwordInput.fill('DemoPass123');
    
    console.log('Credentials entered, clicking submit...');
    
    // Set up network monitoring to catch any API calls
    const apiCalls: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Set up console monitoring to catch any client-side errors
    const consoleMessages: any[] = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });
    
    // Click submit button
    await submitButton.click();
    
    // Wait a moment for any network requests to complete
    await page.waitForTimeout(3000);
    
    // Check for any error messages on the page
    const errorElements = page.locator('[role="alert"], .error, .text-red-500, .text-red-600, .text-red-700');
    const errorCount = await errorElements.count();
    
    console.log(`Found ${errorCount} potential error elements`);
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorElements.nth(i).textContent();
        console.log(`Error ${i + 1}: ${errorText}`);
      }
    }
    
    // Check current URL to see if we redirected
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Log API calls that were made
    console.log('API calls during login:');
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.status} - ${call.url}`);
    });
    
    // Log console messages
    console.log('Console messages:');
    consoleMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
    });
    
    // Check if we're on the dashboard (successful login)
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ LOGIN SUCCESS - Redirected to dashboard');
    } else if (currentUrl.includes('/auth/login')) {
      console.log('❌ LOGIN FAILED - Still on login page');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'login-failure.png', fullPage: true });
      console.log('Screenshot saved: login-failure.png');
    } else {
      console.log(`❓ UNEXPECTED RESULT - Redirected to: ${currentUrl}`);
    }
    
    // Check if there are any network errors
    const networkErrors = apiCalls.filter(call => call.status >= 400);
    if (networkErrors.length > 0) {
      console.log('Network errors detected:');
      networkErrors.forEach(error => {
        console.log(`- ${error.status} ${error.statusText}: ${error.url}`);
      });
    }
    
    // Final status
    console.log('=== LOGIN TEST COMPLETE ===');
  });
});