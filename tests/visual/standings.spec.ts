import { test, expect } from '@playwright/test'
import { openHydratedPage } from './helpers'

test.describe('Standings Pages Visual Regression', () => {
  test('league standings page', async ({ page }) => {
    await openHydratedPage(page, '/standings?season=20252026')
    await expect(page).toHaveScreenshot('league-standings.png', {
      fullPage: true,
    })
  })

  test('division standings page', async ({ page }) => {
    await openHydratedPage(page, '/standings/division?season=20252026')
    await expect(page).toHaveScreenshot('division-standings.png', {
      fullPage: true,
    })
  })

  test('conference standings page', async ({ page }) => {
    await openHydratedPage(page, '/standings/conference?season=20252026')
    await expect(page).toHaveScreenshot('conference-standings.png', {
      fullPage: true,
    })
  })

  test('wildcard standings page', async ({ page }) => {
    await openHydratedPage(page, '/standings/wildcard?season=20252026')
    await expect(page).toHaveScreenshot('wildcard-standings.png', {
      fullPage: true,
    })
  })
})
