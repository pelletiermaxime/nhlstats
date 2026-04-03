import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import GoalieStatsTable from '~/components/GoalieStatsTable.vue'
import type { GoalieStatsWithTeam } from '~/types/goalies'
import type { Team } from '~/types/teams'

const mockTeam = (overrides: Partial<Team> = {}): Team => ({
  _id: 'team123' as unknown as Team['_id'],
  _creationTime: Date.now(),
  short_name: 'TOR',
  city: 'Toronto',
  name: 'Maple Leafs',
  year: 2026,
  division_id: 'div123' as unknown as Team['division_id'],
  ...overrides
})

const mockGoalie = (overrides: Partial<GoalieStatsWithTeam> = {}): GoalieStatsWithTeam => ({
  _id: 'goalie123' as unknown as GoalieStatsWithTeam['_id'],
  _creationTime: Date.now(),
  playerId: 1,
  firstName: 'Jonathan',
  lastName: 'Quick',
  searchName: 'jonathan quick',
  year: 2026,
  gamesPlayed: 45,
  gamesStarted: 44,
  wins: 28,
  losses: 12,
  otLosses: 5,
  shotsAgainst: 1200,
  goalsAgainst: 95,
  saves: 1105,
  savePct: 0.921,
  goalsAgainstAverage: 2.15,
  shutouts: 4,
  timeOnIce: 2650,
  goals: 0,
  assists: 2,
  penaltyMinutes: 4,
  team: mockTeam(),
  ...overrides
})

mockNuxtImport('useConvexQuery', () => () => ({
  data: ref([
    mockTeam({ short_name: 'TOR', city: 'Toronto', name: 'Maple Leafs' }),
    mockTeam({ short_name: 'MTL', city: 'Montreal', name: 'Canadiens' }),
    mockTeam({ short_name: 'NYR', city: 'New York', name: 'Rangers' }),
  ])
}))

describe('GoalieStatsTable', () => {
  it('renders goalie list', async () => {
    const goalies = [
      mockGoalie({ firstName: 'Igor', lastName: 'Shesterkin', wins: 35, savePct: 0.925 }),
      mockGoalie({ firstName: 'Jonathan', lastName: 'Quick', wins: 28, savePct: 0.921 }),
      mockGoalie({ firstName: 'Carey', lastName: 'Price', wins: 22, savePct: 0.905 }),
    ]

    const component = await mountSuspended(GoalieStatsTable, {
      props: {
        goalies,
        selectedTeamShortName: '',
        sortBy: 'wins',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders filtered by team', async () => {
    const goalies = [
      mockGoalie({
        firstName: 'Igor',
        lastName: 'Shesterkin',
        team: mockTeam({ short_name: 'NYR', city: 'New York', name: 'Rangers' })
      }),
      mockGoalie({
        firstName: 'Jonathan',
        lastName: 'Quick',
        team: mockTeam({ short_name: 'NYR', city: 'New York', name: 'Rangers' })
      }),
    ]

    const component = await mountSuspended(GoalieStatsTable, {
      props: {
        goalies,
        selectedTeamShortName: 'NYR',
        sortBy: 'wins',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders with search query', async () => {
    const goalies = [
      mockGoalie({ firstName: 'Igor', lastName: 'Shesterkin', wins: 35 }),
    ]

    const component = await mountSuspended(GoalieStatsTable, {
      props: {
        goalies,
        selectedTeamShortName: '',
        sortBy: 'wins',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
        searchQuery: 'shesterkin',
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders empty state', async () => {
    const component = await mountSuspended(GoalieStatsTable, {
      props: {
        goalies: [],
        selectedTeamShortName: '',
        sortBy: 'wins',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders with GAA sort ascending (lower is better)', async () => {
    const goalies = [
      mockGoalie({ firstName: 'Igor', lastName: 'Shesterkin', goalsAgainstAverage: 2.15 }),
      mockGoalie({ firstName: 'Jonathan', lastName: 'Quick', goalsAgainstAverage: 2.45 }),
    ]

    const component = await mountSuspended(GoalieStatsTable, {
      props: {
        goalies,
        selectedTeamShortName: '',
        sortBy: 'goalsAgainstAverage',
        sortOrder: 'asc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders with save percentage sort', async () => {
    const goalies = [
      mockGoalie({ firstName: 'Igor', lastName: 'Shesterkin', savePct: 0.925 }),
      mockGoalie({ firstName: 'Jonathan', lastName: 'Quick', savePct: 0.921 }),
    ]

    const component = await mountSuspended(GoalieStatsTable, {
      props: {
        goalies,
        selectedTeamShortName: '',
        sortBy: 'savePct',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })
})
