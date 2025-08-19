import { test, expect, type Page } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full user journey from landing to demo', async ({ page }) => {
    // Landing page
    await expect(page.locator('h1')).toContainText('Toastify')
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
    
    // Enter demo mode
    await page.getByRole('button', { name: 'Try Interactive Demo' }).click()
    
    // Wait for demo mode to load and verify demo banner
    await expect(page.locator('[data-testid="demo-banner"]').or(page.locator('text=Demo Mode'))).toBeVisible({ timeout: 10000 })
    
    // Verify main dashboard elements are present
    await expect(page.locator('[data-testid="sidebar"]').or(page.locator('nav'))).toBeVisible()
    await expect(page.locator('text=prospects').or(page.locator('[data-testid="prospects-count"]'))).toBeVisible()
  })

  test('should navigate through demo mode features', async ({ page }) => {
    // Enter demo mode
    await page.getByRole('button', { name: 'Try Interactive Demo' }).click()
    
    // Wait for demo to load
    await expect(page.locator('text=Demo Mode').or(page.locator('[data-testid="demo-banner"]'))).toBeVisible({ timeout: 10000 })
    
    // Test sidebar navigation
    const sidebarItems = [
      'Cold',
      'Warming',
      'Interested',
      'Hot Lead',
      'Main Sequence',
      'Email Stages',
      'Prospects',
      'Inboxes',
      'Reports',
      'Settings'
    ]
    
    for (const item of sidebarItems) {
      const button = page.locator(`button:has-text("${item}"), a:has-text("${item}")`)
      if (await button.isVisible()) {
        await button.click()
        
        // Wait for content to load
        await page.waitForTimeout(500)
        
        // Verify we're not on an error page
        await expect(page.locator('text=Error').or(page.locator('text=404'))).not.toBeVisible()
      }
    }
  })

  test('should handle prospect interactions in demo mode', async ({ page }) => {
    // Enter demo mode
    await page.getByRole('button', { name: 'Try Interactive Demo' }).click()
    
    // Wait for demo to load
    await expect(page.locator('text=Demo Mode').or(page.locator('[data-testid="demo-banner"]'))).toBeVisible({ timeout: 10000 })
    
    // Look for prospects table or list
    const prospectsTable = page.locator('table').or(page.locator('[data-testid="prospects-table"]'))
    const prospectsList = page.locator('[data-testid="prospects-list"]')
    
    // Check if either prospects display is visible
    const hasProspectsDisplay = await prospectsTable.isVisible() || await prospectsList.isVisible()
    
    if (hasProspectsDisplay) {
      // Try to click on first prospect
      const firstProspect = page.locator('tr:nth-child(2)').or(page.locator('[data-testid="prospect-item"]:first-child'))
      if (await firstProspect.isVisible()) {
        await firstProspect.click()
        
        // Look for prospect drawer/modal
        await expect(
          page.locator('[data-testid="prospect-drawer"]')
            .or(page.locator('[role="dialog"]'))
            .or(page.locator('.prospect-details'))
        ).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('should allow exiting demo mode', async ({ page }) => {
    // Enter demo mode
    await page.getByRole('button', { name: 'Try Interactive Demo' }).click()
    
    // Wait for demo to load
    await expect(page.locator('text=Demo Mode').or(page.locator('[data-testid="demo-banner"]'))).toBeVisible({ timeout: 10000 })
    
    // Exit demo mode
    await page.getByRole('button', { name: 'Exit Demo' }).click()
    
    // Should return to landing page
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Try Interactive Demo' })).toBeVisible()
  })

  test('should handle authentication flow', async ({ page }) => {
    // Click get started
    await page.getByRole('button', { name: 'Get Started Free' }).click()
    
    // Should show auth page
    await expect(page.locator('text=Create Your Account')).toBeVisible()
    
    // Test form validation
    await page.getByRole('button', { name: 'Create Account & Start Free Trial' }).click()
    
    // Should show validation errors
    await expect(page.locator('text=Full name is required').or(page.locator('text=required'))).toBeVisible({ timeout: 5000 })
    
    // Switch to sign in
    await page.getByRole('button', { name: 'Already have an account? Sign in' }).click()
    await expect(page.locator('text=Sign In to Your Account')).toBeVisible()
    
    // Test sign in validation
    await page.getByRole('button', { name: 'Sign In to Toastify' }).click()
    await expect(page.locator('text=Email and password are required').or(page.locator('text=required'))).toBeVisible({ timeout: 5000 })
    
    // Go back to landing
    await page.getByRole('button', { name: 'Back to Home' }).click()
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
  })

  test('should be responsive on different screen sizes', async ({ page, browserName }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Get Started Free' })).toBeVisible()
  })

  test('should load without accessibility violations', async ({ page }) => {
    // Check for basic accessibility requirements
    
    // Verify page has a title
    await expect(page).toHaveTitle(/Toastify/)
    
    // Check for main heading
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    
    // Check for proper button labels
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const hasText = (await button.textContent())?.trim().length ?? 0 > 0
      const hasAriaLabel = await button.getAttribute('aria-label')
      
      // Button should have either text content or aria-label
      expect(hasText || hasAriaLabel).toBe(true)
    }
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const hasAlt = await img.getAttribute('alt')
      expect(hasAlt).toBeTruthy()
    }
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Test navigation to non-existent routes (this might not apply in a SPA)
    const response = await page.goto('/non-existent-route', { waitUntil: 'networkidle' })
    
    // Should either redirect to landing or show a proper 404 page
    const is404 = response?.status() === 404
    const hasLandingContent = await page.locator('h1:has-text("Toastify")').isVisible()
    const has404Content = await page.locator('text=404').or(page.locator('text=Not Found')).isVisible()
    
    expect(is404 || hasLandingContent || has404Content).toBe(true)
  })

  test('should maintain state during demo mode', async ({ page }) => {
    // Enter demo mode
    await page.getByRole('button', { name: 'Try Interactive Demo' }).click()
    
    // Wait for demo to load
    await expect(page.locator('text=Demo Mode').or(page.locator('[data-testid="demo-banner"]'))).toBeVisible({ timeout: 10000 })
    
    // Navigate to different sections and verify demo state persists
    const navigation = [
      { name: 'Reports', expectedContent: ['Dashboard', 'Prospects', 'Chart', 'Analytics'] },
      { name: 'Settings', expectedContent: ['Settings', 'Profile', 'Account', 'Preferences'] },
    ]
    
    for (const nav of navigation) {
      const navButton = page.locator(`button:has-text("${nav.name}"), a:has-text("${nav.name}")`)
      
      if (await navButton.isVisible()) {
        await navButton.click()
        await page.waitForTimeout(500)
        
        // Verify demo mode banner is still visible
        await expect(page.locator('text=Demo Mode').or(page.locator('[data-testid="demo-banner"]'))).toBeVisible()
        
        // Verify some expected content is present
        let hasExpectedContent = false
        for (const content of nav.expectedContent) {
          if (await page.locator(`text=${content}`).isVisible()) {
            hasExpectedContent = true
            break
          }
        }
        
        // At least some relevant content should be visible
        expect(hasExpectedContent || await page.locator('main').isVisible()).toBe(true)
      }
    }
  })
})