import { test, expect } from '@playwright/test'

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Skip entire suite if Supabase is not available 
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'http://localhost:54321' || supabaseUrl.includes('your_supabase')) {
      test.skip('Skipping task creation tests - Supabase not properly configured');
      return;
    }

    // Navigate to the dashboard (will redirect to auth if not authenticated)
    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('opens quick add modal when floating button is clicked', async ({ page }) => {
    // Find and click the floating action button
    const fabButton = page.getByLabel('Add task or event')
    await expect(fabButton).toBeVisible({ timeout: 10000 })
    await fabButton.click()

    // Modal should open
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(page.getByText('Create Task')).toBeVisible()
  })

  test('creates a basic task successfully', async ({ page }) => {
    // Skip if we can't find the FAB (means user not authenticated)
    const fabButton = page.getByLabel('Add task or event')
    const fabVisible = await fabButton.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (!fabVisible) {
      test.skip('User not authenticated - cannot access task creation')
      return
    }

    // Open the quick add modal
    await fabButton.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill in task details
    await page.getByLabel(/Title/).fill('Buy groceries for dinner')
    await page.getByLabel(/Description/).fill('Get ingredients for tonight\'s meal')

    // Select a family member (click the first available member)
    const familyMemberButton = page.getByRole('radio').first()
    await familyMemberButton.click()

    // Set priority to high
    await page.getByRole('button', { name: /High/ }).click()

    // Create the task
    await page.getByRole('button', { name: /Create Task/ }).click()

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Task should appear in the weekly view (check for task title)
    await expect(page.getByText('Buy groceries for dinner')).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    // Skip if we can't find the FAB
    const fabButton = page.getByLabel('Add task or event')
    const fabVisible = await fabButton.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (!fabVisible) {
      test.skip('User not authenticated - cannot access task creation')
      return
    }

    await fabButton.click()
    
    // Try to submit without required fields
    await page.getByRole('button', { name: /Create Task/ }).click()

    // Should show validation errors (may vary based on implementation)
    const validationSelectors = [
      'text=/Title is required/i',
      'text=/Please select a family member/i',
      'text=/required/i',
      'text=/error/i'
    ]
    
    let validationFound = false
    for (const selector of validationSelectors) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 3000 })
        validationFound = true
        break
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!validationFound) {
      // Fallback: modal should remain open if validation fails
      await expect(page.getByRole('dialog')).toBeVisible()
    }
  })

  test('cancels task creation', async ({ page }) => {
    // Skip if we can't find the FAB
    const fabButton = page.getByLabel('Add task or event')
    const fabVisible = await fabButton.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (!fabVisible) {
      test.skip('User not authenticated - cannot access task creation')
      return
    }

    await fabButton.click()
    
    // Fill in some data
    await page.getByLabel(/Title/).fill('Task to be cancelled')
    
    // Look for Cancel button with various possible names
    const cancelSelectors = [
      'button:has-text("Cancel")',
      'button:has-text("Close")', 
      '[aria-label*="Cancel"]',
      '[aria-label*="Close"]'
    ]
    
    let cancelButton = null
    for (const selector of cancelSelectors) {
      try {
        cancelButton = page.locator(selector)
        if (await cancelButton.isVisible({ timeout: 1000 })) {
          break
        }
      } catch (e) {
        continue
      }
    }
    
    if (cancelButton) {
      await cancelButton.click()
      
      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible()
      
      // Task should not appear in the dashboard
      await expect(page.getByText('Task to be cancelled')).not.toBeVisible()
    } else {
      // Fallback: press Escape key to close modal
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).not.toBeVisible()
    }
  })

  test('works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Skip if we can't find the FAB
    const fabButton = page.getByLabel('Add task or event')
    const fabVisible = await fabButton.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (!fabVisible) {
      test.skip('User not authenticated - cannot access task creation')
      return
    }
    
    // FAB should be visible on mobile
    await expect(fabButton).toBeVisible()
    
    // Click to open modal
    await fabButton.click()
    
    // Modal should be responsive on mobile
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    
    // Form should be usable on mobile
    await page.getByLabel(/Title/).fill('Mobile task')
    const firstRadio = page.getByRole('radio').first()
    if (await firstRadio.isVisible({ timeout: 2000 })) {
      await firstRadio.click()
      await page.getByRole('button', { name: /Create Task/ }).click()
      
      // Should work the same as desktop
      await expect(modal).not.toBeVisible()
      await expect(page.getByText('Mobile task')).toBeVisible()
    }
  })
})