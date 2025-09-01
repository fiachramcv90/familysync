import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should complete full registration and login flow', async ({ page }) => {
    // Generate unique email for test
    const testEmail = `test-${Date.now()}@example.com`
    
    // Navigate to registration page
    await page.goto('/auth/register')
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="familyName"]', 'Test Family')
    await page.fill('input[name="password"]', 'TestPass123')
    await page.fill('input[name="confirmPassword"]', 'TestPass123')
    
    // Submit registration
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    
    // Logout
    await page.goto('/api/auth/logout', { method: 'POST' })
    
    // Navigate to login page
    await page.goto('/auth/login')
    
    // Fill login form
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'TestPass123')
    
    // Submit login
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Try to submit with weak password
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'weak')
    await page.fill('input[name="confirmPassword"]', 'weak')
    
    await page.click('button[type="submit"]')
    
    // Should show password validation errors
    await expect(page.locator('text=/at least 8 characters/i')).toBeVisible()
  })

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.goto('/auth/register')
    
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Password123')
    await page.fill('input[name="confirmPassword"]', 'Different123')
    
    await page.click('button[type="submit"]')
    
    // Should show password mismatch error
    await expect(page.locator('text=/passwords do not match/i')).toBeVisible()
  })

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    await page.fill('input[name="email"]', 'nonexistent@example.com')
    await page.fill('input[name="password"]', 'WrongPassword123')
    
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=/invalid email or password/i')).toBeVisible()
  })

  test('should protect dashboard route', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard')
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should handle mobile viewport', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
    }
    
    await page.goto('/auth/login')
    
    // Check mobile-responsive elements are visible
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Form should be properly sized for mobile
    const formBox = await page.locator('form').boundingBox()
    expect(formBox?.width).toBeLessThanOrEqual(375)
  })
})