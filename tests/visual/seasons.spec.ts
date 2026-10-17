import { test, expect, type Page, type TestInfo } from '@playwright/test'
import {
  currentSeason,
  easternDate,
  seasonForDate,
  seasonFromYear,
} from '../../shared/utils/seasons'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'
import { openHydratedPage as open, type NuxtRoot } from './helpers'

const CURRENT = currentSeason()
const PREVIOUS = seasonFromYear(CURRENT.year - 1)

test.use({ trace: 'on' })

async function backend(page: Page) {
  const url = await page.evaluate(
    () =>
      document.querySelector<NuxtRoot>('#__nuxt')!.__vue_app__!.config.globalProperties.$nuxt!
        .$config.public.convex.url,
  )
  return new ConvexHttpClient(url)
}

async function expectPlayers(page: Page, year: number, team?: string) {
  const client = await backend(page)
  const selectedTeam = team
    ? await client.query(api.teams.getTeamByShortName, { year, shortName: team })
    : null
  const players = selectedTeam
    ? await client.query(api.playerStats.getPlayerStatsWithTeamsByTeamSorted, {
        year,
        teamId: selectedTeam._id,
        sortBy: 'points',
      })
    : await client.query(api.playerStats.getPlayerStatsWithTeamsSorted, {
        year,
        sortBy: 'points',
        limit: 100,
      })
  expect(players.length).toBeGreaterThan(0)
  await expect(page.locator('table tbody tr td:nth-child(3)')).toHaveText(
    players.map((player) => `${player.firstName} ${player.lastName}`),
  )
  await expect(page.locator('table tbody tr td:nth-child(8)').first()).toHaveText(
    String(players[0]!.points),
  )
}

async function expectGoalies(page: Page, year: number, team?: string) {
  const client = await backend(page)
  const selectedTeam = team
    ? await client.query(api.teams.getTeamByShortName, { year, shortName: team })
    : null
  const goalies = selectedTeam
    ? await client.query(api.goalieStats.getGoalieStatsWithTeamsByTeamSorted, {
        year,
        teamId: selectedTeam._id,
        sortBy: 'wins',
      })
    : await client.query(api.goalieStats.getGoalieStatsWithTeamsSorted, {
        year,
        sortBy: 'wins',
        limit: 100,
      })
  expect(goalies.length).toBeGreaterThan(0)
  await expect(page.locator('table tbody tr td:nth-child(3)')).toHaveText(
    goalies.map((goalie) => `${goalie.firstName} ${goalie.lastName}`),
  )
}

async function capture(page: Page, info: TestInfo, name: string) {
  await info.attach(name, {
    body: await page.screenshot({ fullPage: true, animations: 'disabled' }),
    contentType: 'image/png',
  })
  await info.attach(`${name}-aria`, {
    body: await page.locator('body').ariaSnapshot(),
    contentType: 'text/plain',
  })
  await info.attach(`${name}-state`, {
    body: JSON.stringify(
      {
        url: page.url(),
        season: await page.getByLabel('Season', { exact: true }).inputValue(),
        rows: await page.locator('table tbody tr').count(),
        firstRows: (await page.locator('table tbody tr').allTextContents()).slice(0, 3),
      },
      null,
      2,
    ),
    contentType: 'application/json',
  })
}

async function expectSeason(page: Page, id: number) {
  await expect(page.getByLabel('Season', { exact: true })).toHaveValue(String(id))
  await expect.poll(() => new URL(page.url()).searchParams.get('season')).toBe(String(id))
}

test('season selection follows statistics, teams, navigation, and shared URLs', async ({
  page,
}, info) => {
  test.setTimeout(90000)
  await test.step('Default to the current season', async () => {
    await open(page, '/player-stats')
    await expect(page.getByLabel('Season', { exact: true })).toHaveValue(String(CURRENT.id))
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await expectPlayers(page, CURRENT.year)
    await capture(page, info, 'current-season')
  })
  await test.step('Select the previous season and search its players', async () => {
    await page.getByLabel('Season', { exact: true }).selectOption(String(PREVIOUS.id))
    await expectSeason(page, PREVIOUS.id)
    await expect(page.locator('table tbody tr')).toHaveCount(100)
    await expectPlayers(page, PREVIOUS.year)
    const name = (await page.locator('table tbody tr td:nth-child(3)').first().innerText()).trim()
    await page.getByLabel('Search players').fill(name.split(/\s+/).at(-1)!)
    await expect(page.getByRole('cell', { name, exact: true })).toBeVisible()
    await expect.poll(() => page.locator('table tbody tr').count()).toBeLessThan(100)
    await capture(page, info, 'previous-season-search')
    await page.getByLabel('Search players').fill('')
    await expect(page.locator('table tbody tr')).toHaveCount(100)
    await page.getByLabel('Filter by Team:').selectOption('TOR')
    await expect(page).toHaveURL(new RegExp(`/player-stats/TOR\\?season=${PREVIOUS.id}$`))
    await expectPlayers(page, PREVIOUS.year, 'TOR')
    await capture(page, info, 'previous-team-players')
  })
  await test.step('Preserve the season across goalie stats and every standings view', async () => {
    await page
      .getByRole('link', { name: 'Goalie Stats', exact: true })
      .filter({ visible: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`/goalie-stats\\?season=${PREVIOUS.id}$`))
    await expectSeason(page, PREVIOUS.id)
    await expect(page.getByLabel('Search goalies')).toBeVisible()
    await expectGoalies(page, PREVIOUS.year)
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    await page.getByLabel('Filter by Team:').selectOption('TOR')
    await expect(page).toHaveURL(new RegExp(`/goalie-stats/TOR\\?season=${PREVIOUS.id}$`))
    await expect(page.getByLabel('Filter by Team:')).toHaveValue('TOR')
    await expectGoalies(page, PREVIOUS.year, 'TOR')
    const goalie = (await page.locator('table tbody tr td:nth-child(3)').first().innerText()).trim()
    const surname = goalie.split(/\s+/).at(-1)!
    const unfilteredCount = await page.locator('table tbody tr').count()
    await page.getByLabel('Search goalies').fill(surname)
    await expect.poll(() => page.locator('table tbody tr').count()).toBeLessThan(unfilteredCount)
    await expect(page.getByRole('cell', { name: goalie, exact: true })).toBeVisible()
    for (const name of await page.locator('table tbody tr td:nth-child(3)').allTextContents()) {
      expect(name.toLowerCase()).toContain(surname.toLowerCase())
    }
    await capture(page, info, 'previous-team-goalies')
    await page
      .getByRole('link', { name: 'Standings', exact: true })
      .filter({ visible: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`/standings\\?season=${PREVIOUS.id}$`))
    for (const view of ['Division', 'Conference', 'Wildcard', 'League']) {
      await page.getByRole('link', { name: view, exact: true }).click()
      const path = view === 'League' ? '/standings' : `/standings/${view.toLowerCase()}`
      await expect(page).toHaveURL(new RegExp(`${path}\\?season=${PREVIOUS.id}$`))
      await expectSeason(page, PREVIOUS.id)
      await expect(page.locator('table tbody img').first()).toBeVisible()
    }
    await capture(page, info, 'previous-standings')
  })
  await test.step('Keep team cards, refresh, back/forward, and shared links in the season', async () => {
    await page.getByRole('link', { name: 'Teams', exact: true }).filter({ visible: true }).click()
    await expect(page).toHaveURL(new RegExp(`/teams\\?season=${PREVIOUS.id}$`))
    const toronto = page
      .getByRole('link', { name: /Toronto Maple Leafs/ })
      .filter({ has: page.locator('span') })
    await expect(toronto).toHaveCount(1)
    await expect(page.locator('a[href^="/player-stats/"]')).toHaveCount(32)
    await toronto.click()
    await expect(page).toHaveURL(new RegExp(`/player-stats/TOR\\?season=${PREVIOUS.id}$`))
    await expectSeason(page, PREVIOUS.id)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expectSeason(page, PREVIOUS.id)
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/teams\\?season=${PREVIOUS.id}$`))
    await page.goForward()
    await expect(page).toHaveURL(new RegExp(`/player-stats/TOR\\?season=${PREVIOUS.id}$`))
    await open(page, `/goalie-stats?season=${PREVIOUS.id}`)
    await expectSeason(page, PREVIOUS.id)
    await expectGoalies(page, PREVIOUS.year)
    await capture(page, info, 'shared-previous-season')
    await page.getByLabel('Season', { exact: true }).selectOption(String(CURRENT.id))
    await expectSeason(page, CURRENT.id)
    await expectGoalies(page, CURRENT.year)
    await capture(page, info, 'current-season-restored')
  })
})

test('scores keep their calendar date and season synchronized', async ({ page }, info) => {
  test.setTimeout(60000)
  await open(page, `/scores?season=${PREVIOUS.id}`)
  await expectSeason(page, PREVIOUS.id)
  const previousDate = await page.locator('#date-picker').inputValue()
  expect(seasonForDate(previousDate).id).toBe(PREVIOUS.id)
  await expect(page.getByRole('heading', { name: 'Scores', exact: true })).toBeVisible()
  await capture(page, info, 'previous-season-scores')
  await page.getByLabel('Season', { exact: true }).selectOption(String(CURRENT.id))
  await expectSeason(page, CURRENT.id)
  await expect(page.locator('#date-picker')).toHaveValue(easternDate())
  const fixtureDate = `${PREVIOUS.year}-04-25`
  await page.locator('#date-picker').fill(fixtureDate)
  await page.locator('#date-picker').press('Tab')
  await expect(page).toHaveURL(new RegExp(`/scores/${fixtureDate}\\?season=${PREVIOUS.id}$`))
  await expectSeason(page, PREVIOUS.id)
  await page.getByTitle('Next day', { exact: true }).click()
  await expect(page.locator('#date-picker')).toHaveValue(`${PREVIOUS.year}-04-26`)
  await page.getByTitle('Previous day', { exact: true }).click()
  await expect(page.locator('#date-picker')).toHaveValue(fixtureDate)
  await open(page, `/scores/${fixtureDate}?season=${CURRENT.id}`)
  await expectSeason(page, PREVIOUS.id)
  await capture(page, info, 'date-and-season-aligned')
  const unavailable = seasonFromYear(PREVIOUS.year - 1)
  await open(page, `/scores/${unavailable.year}-04-25`)
  await expect(page.getByLabel('Season', { exact: true })).toHaveValue(String(unavailable.id))
  await expect(
    page.getByText(`Statistics for ${unavailable.label} are not available yet`),
  ).toBeVisible()
})

test('mobile selection is retained through the navigation drawer', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, '/player-stats')
  await page.getByLabel('Season', { exact: true }).selectOption(String(PREVIOUS.id))
  await expectSeason(page, PREVIOUS.id)
  await page.getByRole('button', { name: 'Open main menu' }).click()
  await capture(page, info, 'mobile-season-and-menu')
  await page.locator('#mobile-menu').getByRole('link', { name: 'Teams', exact: true }).click()
  await expectSeason(page, PREVIOUS.id)
  await expect(page.locator('#mobile-menu')).toBeHidden()
  await expect(page.getByRole('link', { name: /Toronto Maple Leafs/ })).toHaveCount(1)
  await capture(page, info, 'mobile-previous-season-teams')
})
