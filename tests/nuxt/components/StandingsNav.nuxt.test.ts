import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import StandingsNav from '~/components/StandingsNav.vue'

describe('StandingsNav', () => {
  it('renders with league active', async () => {
    const component = await mountSuspended(StandingsNav, { props: { active: 'league' } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with division active', async () => {
    const component = await mountSuspended(StandingsNav, { props: { active: 'division' } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with conference active', async () => {
    const component = await mountSuspended(StandingsNav, { props: { active: 'conference' } })
    expect(component.html()).toMatchSnapshot()
  })

  it('renders with wildcard active', async () => {
    const component = await mountSuspended(StandingsNav, { props: { active: 'wildcard' } })
    expect(component.html()).toMatchSnapshot()
  })
})
