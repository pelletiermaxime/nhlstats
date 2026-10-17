import type { QueryCtx, MutationCtx } from '../_generated/server'
import { seasonFromYear } from '../../shared/utils/seasons'

export async function resolveSeasonYear(
  ctx: QueryCtx | MutationCtx,
  year?: number,
): Promise<number> {
  if (year !== undefined) return seasonFromYear(year).year
  const ready = await ctx.db
    .query('seasons')
    .withIndex('by_ready_and_year', (q) => q.eq('ready', true))
    .order('desc')
    .first()
  if (ready) return ready.year
  const latest = await ctx.db.query('standings').withIndex('year').order('desc').first()
  return latest?.year ?? 0
}

export async function seasonTeams(ctx: QueryCtx | MutationCtx, year: number) {
  return ctx.db
    .query('teams')
    .withIndex('by_year_short_name', (q) => q.eq('year', year))
    .take(64)
}

export async function fetchNhl<T>(path: string): Promise<T> {
  const response = await fetch(
    path.startsWith('https://') ? path : `https://api-web.nhle.com/v1/${path}`,
    {
      signal: AbortSignal.timeout(15000),
    },
  )
  if (!response.ok) throw new Error(`NHL request failed (${response.status}): ${path}`)
  return (await response.json()) as T
}
