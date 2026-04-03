import { test, expect } from '@playwright/test'

test.describe('Goalie Stats Pages Visual Regression', () => {
  test('goalie stats list page', async ({ page }) => {
    await page.goto('/goalie-stats')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page).toHaveScreenshot('goalie-stats-list.png', {
      fullPage: true
    })
  })

  test('goalie stats filtered by team', async ({ page }) => {
    await page.goto('/goalie-stats/TOR')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expect(page).toHaveScreenshot('goalie-stats-team-filter.png', {
      fullPage: true
    })
  })

  test('goalie stats with search', async ({ page }) => {
    await page.goto('/goalie-stats')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()

    const searchInput = page.locator('input[placeholder="Search goalies..."]')
    await searchInput.fill('shesterkin')
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    await expect(page).toHaveScreenshot('goalie-stats-search.png', {
      fullPage: true
    })
  })

  test('goalie stats team page with search', async ({ page }) => {
    await page.goto('/goalie-stats/NYR')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('table tbody tr').first()).toBeVisible()

    const searchInput = page.locator('input[placeholder="Search goalies..."]')
    await searchInput.fill('quick')
    await expect(page.locator('table tbody tr')).toHaveCount(1)

    await expect(page).toHaveScreenshot('goalie-stats-team-search.png', {
      fullPage: true
    })
  })
})
