import { test, expect } from '@playwright/test'

test.describe('Toastify Application', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('/')
  })

  test('should display landing page for unauthenticated users', async ({ page }) => {
    // Check for landing page elements
    await expect(page.locator('h1')).toContainText('Toastify')
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try Interactive Demo' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should navigate to demo mode', async ({ page }) => {
    // Click the demo button
    await page.getByRole('button', { name: 'Try Interactive Demo' }).click()

    // Wait for demo mode to load
    await expect(page.locator('[data-testid="demo-banner"]').or(page.locator('text=Demo Mode'))).toBeVisible({ timeout: 10000 })

    // Check for demo features
    await expect(page.locator('text=sample prospects')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exit Demo' })).toBeVisible()
  })

  test('should navigate to authentication page', async ({ page }) => {
    // Click the get started button
    await page.getByRole('button', { name: 'Get Started Free' }).click()

    // Should show auth page
    await expect(page.locator('text=Create Your Account')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account & Start Free Trial' })).toBeVisible()
  })

  test('should switch between sign in and sign up modes', async ({ page }) => {
    // Navigate to auth page
    await page.getByRole('button', { name: 'Get Started Free' }).click()
    
    // Should be in signup mode
    await expect(page.locator('text=Create Your Account')).toBeVisible()

    // Switch to sign in
    await page.getByRole('button', { name: 'Already have an account? Sign in' }).click()
    await expect(page.locator('text=Sign In to Your Account')).toBeVisible()

    // Switch back to sign up
    await page.getByRole('button', { name: "Don't have an account? Sign up free" }).click()
    await expect(page.locator('text=Create Your Account')).toBeVisible()
  })

  test('should navigate back to landing from auth page', async ({ page }) => {
    // Navigate to auth page
    await page.getByRole('button', { name: 'Get Started Free' }).click()
    
    // Click back button
    await page.getByRole('button', { name: 'Back to Home' }).click()

    // Should be back on landing page
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
  })

  test('should validate form fields on auth page', async ({ page }) => {
    // Navigate to auth page
    await page.getByRole('button', { name: 'Get Started Free' }).click()

    // Try to submit without filling fields
    await page.getByRole('button', { name: 'Create Account & Start Free Trial' }).click()

    // Should show validation error
    await expect(page.locator('text=Full name is required')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile layout
      await expect(page.locator('h1')).toBeVisible()
      
      // Check that buttons are properly sized for mobile
      const getStartedBtn = page.getByRole('button', { name: 'Get Started Free' })
      await expect(getStartedBtn).toBeVisible()
      
      const box = await getStartedBtn.boundingBox()
      expect(box?.height).toBeGreaterThan(40) // Minimum touch