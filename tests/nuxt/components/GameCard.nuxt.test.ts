import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GameCard from '~/components/GameCard.vue'
import type { GameWithTeams, EnrichedGoal } from '~/types/games'
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

const mockGoal = (overrides: Partial<EnrichedGoal> = {}): EnrichedGoal => ({
  period: 1,
  timeInPeriod: '10:00',
  playerId: 1,
  lastName: 'Matthews',
  teamAbbrev: 'TOR',
  isEmptyNet: false,
  ...overrides
})

const mockGame = (overrides: Partial<GameWithTeams> = {}): GameWithTeams => ({
  _id: 'game123' as unknown as GameWithTeams['_id'],
  _creationTime: Date.now(),
  gameId: 1,
  gameDate: '2026-04-25',
  season: 20252026,
  homeScore: 2,
  awayScore: 1,
  gameState: 'FINAL',
  period: 3,
  venue: 'Scotiabank Arena',
  startTimeUTC: '2026-04-25T23:00:00Z',
  homeTeam: mockTeam({ short_name: 'TOR', city: 'Toronto', name: 'Maple Leafs' }),
  awayTeam: mockTeam({ short_name: 'MTL', city: 'Montreal', name: 'Canadiens' }),
  goals: [],
  ...overrides
})

describe('GameCard', () => {
  it('renders game with score and teams', async () => {
    const game = mockGame()
    const component = await mountSuspended(GameCard, { props: { game } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders goal scorers by period', async () => {
    const game = mockGame({
      goals: [
        mockGoal({ period: 1, timeInPeriod: '12:34', lastName: 'Matthews', teamAbbrev: 'TOR' }),
        mockGoal({ period: 1, timeInPeriod: '15:20', lastName: 'Suzuki', teamAbbrev: 'MTL' }),
        mockGoal({ period: 2, timeInPeriod: '08:45', lastName: 'Marner', teamAbbrev: 'TOR' }),
      ]
    })
    const component = await mountSuspended(GameCard, { props: { game } })
    expect(component.html()).toMatchSnapshot()
    expect(component.text()).toContain('12:34 Matthews')
    expect(component.text()).toContain('15:20 Suzuki')
    expect(component.text()).toContain('08:45 Marner')
  })

  it('renders empty net modifier', async () => {
    const game = mockGame({
      goals: [
        mockGoal({ period: 3, timeInPeriod: '19:30', lastName: 'Matthews', teamAbbrev: 'TOR', isEmptyNet: true }),
      ]
    })
    const component = await mountSuspended(GameCard, { props: { game } })
    expect(component.html()).toMatchSnapshot()
    expect(component.text()).toContain('(EN)')
  })

  it('renders OT goals', async () => {
    const game = mockGame({
      gameState: 'FINAL',
      homeScore: 3,
      awayScore: 2,
      goals: [
        mockGoal({ period: 4, timeInPeriod: '05:23', lastName: 'Nylander', teamAbbrev: 'TOR' }),
      ]
    })
    const component = await mountSuspended(GameCard, { props: { game } })
    expect(component.html()).toMatchSnapshot()
    expect(component.text()).toContain('OT:')
    expect(component.text()).toContain('05:23 Nylander')
  })

  it('renders scheduled game without goals', async () => {
    const game = mockGame({
      gameState: 'SCHEDULED',
      homeScore: undefined,
      awayScore: undefined,
      goals: []
    })
    const component = await mountSuspended(GameCard, { props: { game } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders live game with period badge', async () => {
    const game = mockGame({
      gameState: 'LIVE',
      period: 2,
      homeScore: 1,
      awayScore: 0,
      goals: [
        mockGoal({ period: 1, timeInPeriod: '05:00', lastName: 'Matthews', teamAbbrev: 'TOR' }),
      ]
    })
    const component = await mountSuspended(GameCard, { props: { game } })
    expect(component.html()).toMatchSnapshot()
    expect(component.text()).toContain('LIVE 2nd')
  })
})
