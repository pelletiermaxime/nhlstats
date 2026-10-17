# Goalie stats

Users can browse goalie statistics, select a team, search by name, and sort the displayed records.

## Sub-features

- `goalies-list` opens a populated all-team leaderboard.
- `goalies-team` filters through the dropdown or a goalie row's team logo.
- `goalies-search` searches within the active scope and clears the search.
- `goalies-sort` changes wins ordering in both directions without a search.

## How to get to it (user POV)

- Choose `Goalie Stats` from the desktop menu or mobile drawer.
- Open `/goalie-stats` or `/goalie-stats/TOR` directly.
- Click a goalie row's team-logo link.

## Driving it with Playwright

Preconditions: Doctor passes and the selected team has goalie data. Use a fresh context as described in the skill.

- **Existing tests:** `vp exec playwright test tests/visual/goalie-stats.spec.ts --workers=1` covers list/team screenshots and searches. Use playwright-cli for uncovered actions below.
- **Open/filter:** use CLI `goto http://localhost:3000/goalie-stats`, take a snapshot, then `select '#team-filter' TOR`. Require `/goalie-stats/TOR`, selected value `TOR`, populated rows, and row logos ending in `/TOR.svg`.
- **Logo entry:** from the all-team list, click a row link to `/goalie-stats/TOR` and check the same result. Select the empty dropdown value to return to `/goalie-stats`.
- **Search/clear:** read a visible name from `table tbody tr td:nth-child(3)` and use CLI `fill '#goalie-search'` with its surname. Wait for matching rows; clear and require the list to return. Exercise both all-team and team scopes when search changes.
- **Sort:** clear search, click the `W` column header's reference from a fresh CLI snapshot, and check the arrow plus numeric ordering in `table tbody tr td:nth-child(6)`. Repeat to prove the opposite direction.
- **Evidence:** save actions, selected team, observed names, resulting URLs, screenshots, and ARIA snapshots. Existing screenshot coverage: `vp exec playwright test tests/visual/goalie-stats.spec.ts --workers=1`.

## Gotchas

- Search is debounced, and live records can change independently of the browser run.
- Save percentages and GAA use different display formats; a rendering pass does not verify source units or qualification rules.
- Do not use a skater's presence or a hardcoded roster as a goalie-data prerequisite.
