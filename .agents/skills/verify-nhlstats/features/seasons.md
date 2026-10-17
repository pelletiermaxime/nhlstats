# Site-wide seasons

Users can choose a ready NHL season in the main navigation. The choice is encoded as a season ID in the URL and carried through statistics, team links, searches, and score dates. A fresh statistics URL without a selection defaults to the current season.

## Sub-features

- `season-default` selects the current NHL season and labels it with both calendar years.
- `season-navigation` preserves the selected season across team pages and every standings view.
- `season-search` searches player and goalie records within the selected season and team.
- `season-history` preserves the choice on reload, back/forward, and shared URLs.
- `season-scores` aligns the selector and date; current scores open today, past scores open the latest loaded game date.
- `season-mobile` keeps the selector available and preserves its choice through the mobile drawer.

## How to get to it (user POV)

- Use the year dropdown beside the auth links on desktop or beside the menu button on mobile. Its accessible name is `Season`.
- Open `/player-stats` for the current default, or `/player-stats?season=20252026` for 2025–26.
- Use the same `season` query on `/goalie-stats`, `/standings`, `/teams`, and `/scores`.

## Driving it with Playwright

Preconditions: Doctor passes, the current and previous seasons are ready in the dropdown, and their datasets are populated. Loading seasons is an implementation/operations task; never invoke imports from this verification workflow.

- **Runnable proof:** `.agents/skills/verify-nhlstats/scripts/verify.mjs seasons` runs `tests/visual/seasons.spec.ts` with one worker and retains its JSON report, screenshots, ARIA snapshots, and traces in a unique `/tmp/nhlstats-seasons-verify-*` directory. The helper reports the exact path and fails if a test is skipped or flaky.
- **Uncovered behavior:** use playwright-cli following [the shared workflow](../references/playwright-cli.md). The actions below describe the existing tests' expectations and any additional CLI exploration.
- **Selector:** use CLI `select '#season-selector' 20252026`; require the selected value and matching URL query. Observe current/previous option values instead of assuming these examples stay current forever.
- **Navigation/search:** select a team, search an observed surname, clear it, then use the visible Goalie Stats, Standings, and Teams links. Require the expected pathname before acting on the destination's controls. Exercise League, Division, Conference, and Wildcard, and require one Toronto card among 32 teams for these modern seasons.
- **History:** follow the Toronto card, wait for its player-stats pathname, reload, then use back/forward. Open a shared previous-season URL directly and switch to current again.
- **Scores:** open `/scores?season=20252026`; require a date in that season. Switch to current and require today's Eastern date. Choose a previous-season date and use next/previous day. An explicit dated URL wins over a conflicting season query and normalizes it.
- **Mobile:** use a 390×844 viewport, select the previous season, open `Open main menu`, and choose Teams inside `#mobile-menu`. Require the previous-season query and a closed drawer.

## Gotchas

- The stored `year` and MCP `year` mean the season's ending year: 2026 means 2025–26; browser URLs use NHL IDs such as 20252026.
- A selected dropdown value can change before asynchronous navigation completes. Wait for both the URL and destination-specific controls.
- Fresh URLs default to current; explicit previous-season links retain their choice without an account preference or cookie.
- Completed-season stats and standings are regular-season totals. Scores include loaded regular-season and playoff games; schedule imports do not fetch every game's goal-scorer detail.
- Only ready imported seasons are offered. Empty data and an unavailable season are different states.
- A valid URL for an unloaded season shows an unavailable message and retains that season's label; it does not display another season's records.
