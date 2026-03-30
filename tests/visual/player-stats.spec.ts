import { test, expect } from '@playwright/test'

test.describe('Player Stats Pages Visual Regression', () => {
  test('player stats list page', async ({ page }) => {
    await page.goto('/player-stats')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr')).toHaveCount(100)
    await expect(page).toHaveScreenshot('player-stats-list.png', {
      fullPage: true
    })
  })

  test('player stats filtered by team', async ({ page }) => {
    await page.goto('/player-stats/TOR')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page).toHaveScreenshot('player-stats-team-filter.png', {
      fullPage: true
    })
  })

  test('player stats with search', async ({ page }) => {
    await page.goto('/player-stats')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr')).toHaveCount(100)

    const searchInput = page.locator('input[placeholder="Search players..."]')
    await searchInput.fill('mcdavid')
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    await expect(page).toHaveScreenshot('player-stats-search.png', {
      fullPage: true
    })
  })

  test('player stats team page with search', async ({ page }) => {
    await page.goto('/player-stats/TOR')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()

    const searchInput = page.locator('input[placeholder="Search players..."]')
    await searchInput.fill('matthews')
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    await expect(page).toHaveScreenshot('player-stats-team-search.png', {
      fullPage: true
    })
  })
})
