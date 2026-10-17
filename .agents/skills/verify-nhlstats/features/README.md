# NHL Stats verification map

This is an incremental map of six public, read-only web features. Start with Doctor in [the skill](../SKILL.md), then follow the affected feature's recipe against the existing local site. Authentication, desktop packaging, ingestion, and MCP protocol behavior are outside this map.

## Preconditions and conventions

- The user has the site running at `http://localhost:3000` with a populated Convex deployment. Never start or restart a service, reseed, or invoke imports.
- Use existing Playwright tests when they cover the behavior; use playwright-cli for every uncovered browser check in a named, anonymous, isolated session. Do not take over a human-controlled tab.
- Navigation links exist in the desktop bar and mobile drawer. Test both when navigation changes; direct URLs alone do not prove either menu.
- Live records can change. Observe names and counts from the current page rather than hardcoding a player's team or exact statistics. Missing data is a blocker for a populated-data claim.
- Run existing specs linked by each feature, or `.agents/skills/verify-nhlstats/scripts/verify.mjs seasons` for the season tests. Use [the playwright-cli workflow](../references/playwright-cli.md) for actions without test coverage; no single command exercises the entire map.
- Capture the action and resulting URL/control/data state, screenshots, and ARIA snapshots. Store evidence outside `test-results/` and verify it survives cleanup.

## Features

| Feature | Routes and proof |
| --- | --- |
| [Site-wide seasons](seasons.md) | Current default, previous season, searches, navigation, history, score dates, mobile |
| [Player stats](player-stats.md) | Home redirect, all/team lists, search/clear, logo links, goal sorting |
| [Goalie stats](goalie-stats.md) | All/team lists, search/clear, logo links, wins sorting |
| [Standings](standings.md) | League, division, conference, wildcard, team links |
| [Teams and navigation](teams.md) | Division-grouped teams, team links, desktop/mobile navigation |
| [Scores](scores.md) | Today redirect, date picker, previous/next dates, game cards |

## Season coverage

The selector is labeled `Season`. The dedicated season recipe and runner verify current/previous-season behavior across the mapped views. Existing screenshot specs use the completed 2025–26 dataset for stable baselines; the season journey checks the live current default separately.
