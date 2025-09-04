// Task Creation End-to-End Tests
// Story 2.1: Task Creation and Basic Management

import { test, expect } from '@playwright/test';

test.describe('Task Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('opens quick add modal when floating button is clicked', async ({ page }) => {
    // Find and click the floating action button
    const fabButton = page.getByLabel('Add task or event');
    await expect(fabButton).toBeVisible();
    await fabButton.click();

    // Modal should open
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByText('Create Task')).toBeVisible();
  });

  test('creates a basic task successfully', async ({ page }) => {
    // Open the quick add modal
    await page.getByLabel('Add task or event').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in task details
    await page.getByLabel(/Title/).fill('Buy groceries for dinner');
    await page.getByLabel(/Description/).fill('Get ingredients for tonight\'s meal');

    // Select a family member (click the first available member)
    const familyMemberButton = page.getByRole('radio').first();
    await familyMemberButton.click();

    // Set priority to high
    await page.getByRole('button', { name: /High/ }).click();

    // Create the task
    await page.getByRole('button', { name: /Create Task/ }).click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Task should appear in the weekly view (check for task title)
    await expect(page.getByText('Buy groceries for dinner')).toBeVisible();
  });

  test('switches between task and event types', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Should start with "Create Task"
    await expect(page.getByText('Create Task')).toBeVisible();

    // Switch to event
    await page.getByRole('radio', { name: /Event/ }).click();
    
    // Should change to "Create Event"
    await expect(page.getByText('Create Event')).toBeVisible();

    // Switch back to task
    await page.getByRole('radio', { name: /Task/ }).click();
    
    // Should change back to "Create Task"
    await expect(page.getByText('Create Task')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Try to submit without required fields
    await page.getByRole('button', { name: /Create Task/ }).click();

    // Should show validation errors
    await expect(page.getByText('Title is required')).toBeVisible();
    await expect(page.getByText('Please select a family member')).toBeVisible();
    
    // Modal should remain open
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('sets due date using quick options', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Fill required fields first
    await page.getByLabel(/Title/).fill('Test task with due date');
    await page.getByRole('radio').first().click(); // Select first family member

    // Set due date to "Tomorrow"
    await page.getByRole('button', { name: /Tomorrow/ }).click();
    
    // Should show due date is set
    await expect(page.getByText('Due Tomorrow')).toBeVisible();

    // Clear the due date
    await page.getByLabel('Clear due date').click();
    
    // Due date display should be gone
    await expect(page.getByText('Due Tomorrow')).not.toBeVisible();
  });

  test('cancels task creation', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Fill in some data
    await page.getByLabel(/Title/).fill('Task to be cancelled');
    
    // Click cancel
    await page.getByRole('button', { name: /Cancel/ }).click();
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Task should not appear in the dashboard
    await expect(page.getByText('Task to be cancelled')).not.toBeVisible();
  });

  test('creates task with all optional fields', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Fill in all fields
    await page.getByLabel(/Title/).fill('Complete family project');
    await page.getByLabel(/Description/).fill('Finish the home improvement project this weekend');
    
    // Select family member
    await page.getByRole('radio').first().click();
    
    // Set high priority
    await page.getByRole('button', { name: /High/ }).click();
    
    // Set due date to this weekend
    await page.getByRole('button', { name: /This Weekend/ }).click();
    
    // Create the task
    await page.getByRole('button', { name: /Create Task/ }).click();
    
    // Modal should close and task should be created
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Complete family project')).toBeVisible();
  });

  test('handles keyboard navigation in modal', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Title input should be focused by default
    const titleInput = page.getByLabel(/Title/);
    await expect(titleInput).toBeFocused();
    
    // Tab through the form
    await page.keyboard.press('Tab'); // Should focus description
    await page.keyboard.press('Tab'); // Should focus priority buttons
    
    // Use arrow keys to navigate priority buttons
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    
    // Press Escape to close modal
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows loading state during task creation', async ({ page }) => {
    await page.getByLabel('Add task or event').click();
    
    // Fill required fields
    await page.getByLabel(/Title/).fill('Loading test task');
    await page.getByRole('radio').first().click();
    
    // Intercept the API call to make it slow
    await page.route('/api/tasks', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Click create and check for loading state
    const createButton = page.getByRole('button', { name: /Create Task/ });
    await createButton.click();
    
    // Should show loading text and be disabled
    await expect(page.getByText('Creating task...')).toBeVisible();
    await expect(createButton).toBeDisabled();
    
    // Cancel button should also be disabled during loading
    await expect(page.getByRole('button', { name: /Cancel/ })).toBeDisabled();
  });

  test('works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // FAB should be visible on mobile
    const fabButton = page.getByLabel('Add task or event');
    await expect(fabButton).toBeVisible();
    
    // Click to open modal
    await fabButton.click();
    
    // Modal should be responsive on mobile
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // Form should be usable on mobile
    await page.getByLabel(/Title/).fill('Mobile task');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Create Task/ }).click();
    
    // Should work the same as desktop
    await expect(modal).not.toBeVisible();
    await expect(page.getByText('Mobile task')).toBeVisible();
  });
});