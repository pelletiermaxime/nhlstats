import { test, expect } from '@playwright/test'

test.describe('Scores Page Visual Regression', () => {
  test('scores page', async ({ page }) => {
    await page.goto('/scores/2026-04-25')
    await expect(page).toHaveScreenshot('scores.png', {
      fullPage: true
    })
  })
})
