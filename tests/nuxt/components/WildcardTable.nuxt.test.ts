import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WildcardTable from '~/components/WildcardTable.vue'
import type { StandingWithStatus } from '~/types/teams'

const mockStandingWithStatus = (overrides: Partial<StandingWithStatus> = {}): StandingWithStatus => ({
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
  playoffStatus: 'division-leader',
  year: 2025,
  ...overrides
})

describe('WildcardTable', () => {
  it('renders wildcard table with sections', async () => {
    const sections = [
      { title: 'Atlantic Division', teams: [mockStandingWithStatus({ short_name: 'TOR' })] },
      { title: 'Metropolitan Division', teams: [mockStandingWithStatus({ short_name: 'NYR', city: 'New York', name: 'Rangers', division: 'METROPOLITAN' })] }
    ]
    const component = await mountSuspended(WildcardTable, { props: { sections } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with wildcard section', async () => {
    const sections = [
      { title: 'Atlantic Division', teams: [mockStandingWithStatus({ short_name: 'TOR' })] },
      { title: 'Metropolitan Division', teams: [mockStandingWithStatus({ short_name: 'NYR', city: 'New York', name: 'Rangers', division: 'METROPOLITAN' })] },
      { title: 'Wild Card', teams: [mockStandingWithStatus({ short_name: 'FLA', city: 'Florida', name: 'Panthers', playoffStatus: 'playoff-spot' })] }
    ]
    const component = await mountSuspended(WildcardTable, { props: { sections } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders empty sections', async () => {
    const sections = [
      { title: 'Division', teams: [] }
    ]
    const component = await mountSuspended(WildcardTable, { props: { sections } })
    expect(component.html()).toMatchSnapshot()
  })
})
