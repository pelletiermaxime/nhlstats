import { test, expect } from '@playwright/test'

test.describe('Standings Pages Visual Regression', () => {
  test('league standings page', async ({ page }) => {
    await page.goto('/standings')
    await expect(page).toHaveScreenshot('league-standings.png', {
      fullPage: true
    })
  })

  test('division standings page', async ({ page }) => {
    await page.goto('/standings/division')
    await expect(page).toHaveScreenshot('division-standings.png', {
      fullPage: true
    })
  })

  test('conference standings page', async ({ page }) => {
    await page.goto('/standings/conference')
    await expect(page).toHaveScreenshot('conference-standings.png', {
      fullPage: true
    })
  })

  test('wildcard standings page', async ({ page }) => {
    await page.goto('/standings/wildcard')
    await expect(page).toHaveScreenshot('wildcard-standings.png', {
      fullPage: true
    })
  })
})
