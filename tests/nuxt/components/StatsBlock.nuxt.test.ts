import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StatsBlock from '~/components/StatsBlock.vue'
import type { Standing } from '~/types/teams'

const mockStanding = (overrides: Partial<Standing> = {}): Standing => ({
  conference: 'EAST',
  short_name: 'TOR',
  city: 'Toronto',
  name: 'Maple Leafs',
  division: 'ATLANTIC',
  gp: 50,
  w: 30,
  l: 15,
  otl: 5,
  pts: 65,
  row: 28,
  gf: 150,
  ga: 120,
  diff: '+30',
  home: '15-5-5',
  away: '15-10-0',
  l10: '7-3-0',
  streak: 'W3',
  year: 2025,
  ...overrides
})

describe('StatsBlock', () => {
  it('renders standings table rows', async () => {
    const standings = [mockStanding(), mockStanding({ short_name: 'MTL', city: 'Montreal', name: 'Canadiens' })]
    const component = await mountSuspended(StatsBlock, { props: { standings } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with division column', async () => {
    const standings = [mockStanding()]
    const component = await mountSuspended(StatsBlock, { props: { standings, showDivision: true, showConference: false } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with conference column', async () => {
    const standings = [mockStanding()]
    const component = await mountSuspended(StatsBlock, { props: { standings, showDivision: false, showConference: true } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with both columns hidden', async () => {
    const standings = [mockStanding()]
    const component = await mountSuspended(StatsBlock, { props: { standings, showDivision: false, showConference: false } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders conference background colors correctly', async () => {
    const standings = [
      mockStanding({ conference: 'EAST', short_name: 'TOR' }),
      mockStanding({ conference: 'WEST', short_name: 'VGK', city: 'Vegas', name: 'Golden Knights' })
    ]
    const component = await mountSuspended(StatsBlock, { props: { standings } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders position numbers correctly', async () => {
    const standings = [
      mockStanding(),
      mockStanding({ short_name: 'MTL', city: 'Montreal', name: 'Canadiens' }),
      mockStanding({ short_name: 'BOS', city: 'Boston', name: 'Bruins' })
    ]
    const component = await mountSuspended(StatsBlock, { props: { standings } })
    expect(component.html()).toMatchSnapshot()
  })
})
