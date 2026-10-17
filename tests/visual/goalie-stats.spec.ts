import { test, expect } from '@playwright/test'
import { openHydratedPage } from './helpers'

test.describe('Goalie Stats Pages Visual Regression', () => {
  test('goalie stats list page', async ({ page }) => {
    await openHydratedPage(page, '/goalie-stats?season=20252026')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page).toHaveScreenshot('goalie-stats-list.png', {
      fullPage: true,
    })
  })

  test('goalie stats filtered by team', async ({ page }) => {
    await openHydratedPage(page, '/goalie-stats/TOR?season=20252026')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page).toHaveScreenshot('goalie-stats-team-filter.png', {
      fullPage: true,
    })
  })

  test('goalie stats with search', async ({ page }) => {
    await openHydratedPage(page, '/goalie-stats?season=20252026')
    await expect(page.locator('table tbody tr').first()).toBeVisible()

    const searchInput = page.locator('input[placeholder="Search goalies..."]')
    await searchInput.fill('shesterkin')
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    await expect(page).toHaveScreenshot('goalie-stats-search.png', {
      fullPage: true,
    })
  })

  test('goalie stats team page with search', async ({ page }) => {
    await openHydratedPage(page, '/goalie-stats/NYR?season=20252026')
    await expect(page.locator('table tbody tr').first()).toBeVisible()

    const searchInput = page.locator('input[placeholder="Search goalies..."]')
    await searchInput.fill('quick')
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    await expect(page).toHaveScreenshot('goalie-stats-team-search.png', {
      fullPage: true,
    })
  })
})
