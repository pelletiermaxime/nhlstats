import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import GroupedStandings from '~/components/GroupedStandings.vue'
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

describe('GroupedStandings', () => {
  it('renders group sections', async () => {
    const groupedStandings = {
      'Eastern Conference': [
        mockStanding({ short_name: 'TOR' }),
        mockStanding({ short_name: 'MTL', city: 'Montreal', name: 'Canadiens' })
      ],
      'Western Conference': [
        mockStanding({ conference: 'WEST', short_name: 'VGK', city: 'Vegas', name: 'Golden Knights' })
      ]
    }
    const component = await mountSuspended(GroupedStandings, { props: { groupedStandings } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with division column', async () => {
    const groupedStandings = {
      'Division Group': [mockStanding({ division: 'ATLANTIC' })]
    }
    const component = await mountSuspended(GroupedStandings, { props: { groupedStandings, showDivision: true, showConference: false } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders empty groups', async () => {
    const groupedStandings = {
      'Empty Group': []
    }
    const component = await mountSuspended(GroupedStandings, { props: { groupedStandings } })
    expect(component.html()).toMatchSnapshot()
  })
})
