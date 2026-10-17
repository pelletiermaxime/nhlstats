import { test, expect } from '@playwright/test'
import { openHydratedPage } from './helpers'

test.describe('Scores Page Visual Regression', () => {
  test('scores page', async ({ page }) => {
    await openHydratedPage(page, '/scores/2026-04-25?season=20252026')
    await expect(page).toHaveScreenshot('scores.png', {
      fullPage: true,
    })
  })
})
