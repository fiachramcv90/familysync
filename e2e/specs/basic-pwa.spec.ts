import { test, expect } from '@playwright/test'

test.describe('Basic PWA Functionality', () => {
  test('should load homepage correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads with the correct title
    await expect(page).toHaveTitle(/FamilySync/)
    
    // Check main heading is visible
    await expect(page.getByRole('heading', { name: 'Welcome to FamilySync' })).toBeVisible()
    
    // Check description text in main content area
    await expect(page.locator('main').getByText('Family coordination made simple')).toBeVisible()
  })

  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/')
    
    // Check that manifest link exists in head
    const manifest = page.locator('link[rel="manifest"]')
    await expect(manifest).toHaveAttribute('href', '/manifest.json')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that content is still visible on mobile
    await expect(page.getByRole('heading', { name: 'Welcome to FamilySync' })).toBeVisible()
    await expect(page.locator('main').getByText('Family coordination made simple')).toBeVisible()
  })

  test('should have service worker registered', async ({ page }) => {
    await page.goto('/')
    
    // Check if service worker is available
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    
    expect(swRegistered).toBe(true)
  })
})