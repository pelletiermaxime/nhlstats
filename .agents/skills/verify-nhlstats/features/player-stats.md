# Player stats

Users can browse skater leaders, select a team, search by name, and change the statistical ordering.

## Sub-features

- `players-home` follows the home redirect to the all-team leaderboard.
- `players-team` filters through the dropdown or a row's team-logo link.
- `players-search` searches all players or the selected team and restores the list when cleared.
- `players-sort` orders numeric columns in both directions without an active search.

## How to get to it (user POV)

- Open `/` or choose `Player Stats` in the desktop menu or mobile drawer.
- Open `/player-stats` or `/player-stats/TOR` directly.
- Follow a team link from Teams, Standings, or a player row's logo.

## Driving it with Playwright

Preconditions: Doctor passes and the selected team has player data.

- **Existing tests:** `vp exec playwright test tests/visual/player-stats.spec.ts --workers=1` covers list/team screenshots and searches. Use playwright-cli for uncovered actions below, including numeric sort assertions and row-logo navigation.
- **Filter:** use `select '#team-filter' TOR` in the named CLI session; require pathname `/player-stats/TOR`, selected value `TOR`, and every result-row logo ending in `/TOR.svg`. Choose the empty value to return to `/player-stats`.
- **Logo entry:** from `/player-stats`, click a result-row link whose `href` is `/player-stats/TOR`; require the same Toronto filter and populated table. This entry is separate from the runnable dropdown proof.
- **Search:** read a current result's name from `table tbody tr td:nth-child(3)`, use CLI `fill '#player-search'` with the observed surname, and wait for matching rows. Clear the input and require the unfiltered list to return. Repeat on all-team and team pages when search changes.
- **Sort:** with an empty search, click the `G` column header's reference from a fresh CLI snapshot. Require the down arrow and nonincreasing values in `table tbody tr td:nth-child(6)`. Click again and require the up arrow and nondecreasing values.
- **Evidence:** capture the starting list, selected team, search value/results, cleared list, and both sort directions. Existing screenshot coverage: `vp exec playwright test tests/visual/player-stats.spec.ts --workers=1`.

## Gotchas

- Name search is debounced. Wait for result content, not a fixed delay.
- Full-name searches can match individual tokens rather than an exact phrase. Use an observed surname for the single-term proof, and record the term and matching names.
- A populated table is required to prove filtering or sorting; an empty table is not a pass.
- Sorting while searching is a separate behavior and is not established by the empty-search proof.
- Use the dedicated season recipe to establish historical isolation; this single-season journey alone does not prove it.
- Server-rendered rows can appear before the client is interactive. A hydration timeout or `/_nuxt/` HTTP 502 is a runtime blocker, even if Doctor and the visible table pass.
