import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PlayerStatsTable from '~/components/PlayerStatsTable.vue'
import type { PlayerStatsWithTeam } from '~/types/players'
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

const mockPlayer = (overrides: Partial<PlayerStatsWithTeam> = {}): PlayerStatsWithTeam => ({
  _id: 'player123' as unknown as PlayerStatsWithTeam['_id'],
  _creationTime: Date.now(),
  playerId: 1,
  firstName: 'Auston',
  lastName: 'Matthews',
  searchName: 'auston matthews',
  positionCode: 'C',
  year: 2026,
  gamesPlayed: 70,
  goals: 45,
  assists: 35,
  points: 80,
  plusMinus: 15,
  penaltyMinutes: 20,
  pointsPerGame: 1.14,
  gameWinningGoals: 8,
  overtimeGoals: 3,
  shots: 250,
  shootingPct: 18.0,
  timeOnIcePerGame: 1200,
  faceoffWinPct: 52.0,
  powerPlayGoals: 12,
  powerPlayAssists: 10,
  powerPlayPoints: 22,
  shorthandedGoals: 2,
  shorthandedAssists: 1,
  shorthandedPoints: 3,
  team: mockTeam(),
  ...overrides
})

vi.mock('better-convex-nuxt', () => ({
  useConvexQuery: () => ({
    data: ref([
      mockTeam({ short_name: 'TOR', city: 'Toronto', name: 'Maple Leafs' }),
      mockTeam({ short_name: 'MTL', city: 'Montreal', name: 'Canadiens' }),
      mockTeam({ short_name: 'VGK', city: 'Vegas', name: 'Golden Knights' }),
    ])
  })
}))

describe('PlayerStatsTable', () => {
  it('renders player list', async () => {
    const players = [
      mockPlayer({ firstName: 'Connor', lastName: 'McDavid', points: 124 }),
      mockPlayer({ firstName: 'Auston', lastName: 'Matthews', points: 80 }),
      mockPlayer({ firstName: 'Nathan', lastName: 'MacKinnon', points: 95 }),
    ]

    const component = await mountSuspended(PlayerStatsTable, {
      props: {
        players,
        selectedTeamShortName: '',
        sortBy: 'points',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders filtered by team', async () => {
    const players = [
      mockPlayer({
        firstName: 'Auston',
        lastName: 'Matthews',
        team: mockTeam({ short_name: 'TOR', city: 'Toronto', name: 'Maple Leafs' })
      }),
      mockPlayer({
        firstName: 'Mitch',
        lastName: 'Marner',
        team: mockTeam({ short_name: 'TOR', city: 'Toronto', name: 'Maple Leafs' })
      }),
    ]

    const component = await mountSuspended(PlayerStatsTable, {
      props: {
        players,
        selectedTeamShortName: 'TOR',
        sortBy: 'points',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders with search query', async () => {
    const players = [
      mockPlayer({ firstName: 'Connor', lastName: 'McDavid', points: 124 }),
    ]

    const component = await mountSuspended(PlayerStatsTable, {
      props: {
        players,
        selectedTeamShortName: '',
        sortBy: 'points',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
        searchQuery: 'mcdavid',
      }
    })

    expect(component.html()).toMatchSnapshot()
  })

  it('renders empty state', async () => {
    const component = await mountSuspended(PlayerStatsTable, {
      props: {
        players: [],
        selectedTeamShortName: '',
        sortBy: 'points',
        sortOrder: 'desc',
        onTeamChange: vi.fn(),
        onSortChange: vi.fn(),
      }
    })

    expect(component.html()).toMatchSnapshot()
  })
})
