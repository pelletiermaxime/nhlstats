# Standings

Users can switch among league, division, conference, and wildcard tables and open a team's player statistics.

## Sub-features

- `standings-league` shows the combined league table.
- `standings-division` and `standings-conference` show the corresponding groups.
- `standings-wildcard` shows division places and wildcard/out-of-playoff sections.
- `standings-team` follows a team logo into player stats.

## How to get to it (user POV)

- Choose `Standings` in the desktop menu or mobile drawer.
- Open `/standings`, `/standings/division`, `/standings/conference`, or `/standings/wildcard`.
- Use the `League`, `Division`, `Conference`, and `Wildcard` links above the tables.

## Driving it with Playwright

Preconditions: Doctor passes and standings rows are present.

- **Existing tests:** run `tests/visual/standings.spec.ts` for the four views and `tests/visual/seasons.spec.ts` for clicked view navigation. Use playwright-cli for uncovered actions such as a standings team link.
- **League:** use CLI `goto http://localhost:3000/standings`; wait for `#tableOverall tbody tr`. Record displayed teams and numeric points; do not accept headers alone as a populated table.
- **Views:** click the `Division` link's reference from a fresh CLI snapshot, then `Conference`, `Wildcard`, and `League`. Require each matching pathname and populated data. Division/conference views show `Western Conference` and `Eastern Conference` headings; wildcard sections depend on loaded teams.
- **Team link:** read a table link matching `table tbody a[href^="/player-stats/"]`, record its target, click it, and require that pathname, the corresponding selected team, and player rows.
- **Evidence:** capture each visited view and the team-link action/result. Existing screenshot coverage: `vp exec playwright test tests/visual/standings.spec.ts --workers=1`.

## Gotchas

- A visual pass does not establish official NHL tiebreak correctness or historical completeness.
- Group labels and available rows depend on data. Treat missing groups as a finding or prerequisite failure, not a reason to reseed.
- Direct routes and clicked view links are distinct entry points; report which were exercised.
