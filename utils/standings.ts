import type { Standing } from '~/types/teams'

export function compareStandings(a: Standing, b: Standing): number {
  if (b.pts !== a.pts) return b.pts - a.pts
  if (a.gp !== b.gp) return a.gp - b.gp
  if (b.row !== a.row) return b.row - a.row
  return b.w - a.w
}
