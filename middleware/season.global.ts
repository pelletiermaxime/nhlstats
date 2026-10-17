import { parseSeasonId, seasonForDate } from '~/shared/utils/seasons'

export default defineNuxtRouteMiddleware((to) => {
  if (
    !to.path.startsWith('/scores/') ||
    !('date' in to.params) ||
    typeof to.params.date !== 'string' ||
    to.query.season === undefined
  )
    return
  try {
    const id = seasonForDate(to.params.date).id
    if (parseSeasonId(to.query.season) !== id) {
      return navigateTo(
        { path: to.path, query: { ...to.query, season: String(id) } },
        { replace: true },
      )
    }
  } catch {
    return
  }
})
