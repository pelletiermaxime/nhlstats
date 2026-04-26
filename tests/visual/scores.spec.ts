import { test, expect } from '@playwright/test'

test.describe('Scores Page Visual Regression', () => {
  test('scores page', async ({ page }) => {
    await page.goto('/scores')
    await expect(page).toHaveScreenshot('scores.png', {
      fullPage: true
    })
  })
})
