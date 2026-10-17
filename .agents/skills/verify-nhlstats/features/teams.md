# Teams and navigation

Users can browse teams by division, open a team's skaters, and navigate the site from desktop or mobile menus.

## Sub-features

- `teams-list` displays division-grouped teams with names and logos.
- `teams-player-link` opens the chosen team's player statistics.
- `navigation-desktop` and `navigation-mobile` reach the public statistics pages.

## How to get to it (user POV)

- Choose `Teams` in the desktop menu or mobile drawer, or open `/teams`.
- Choose `Standings`, `Scores`, `Player Stats`, or `Goalie Stats` in the same menus.
- Click a team's named card on the Teams page.

## Driving it with Playwright

Preconditions: Doctor passes and teams are populated.

- **Existing tests:** `vp exec playwright test tests/visual/seasons.spec.ts --workers=1` covers desktop/mobile Teams navigation and the Toronto card with season persistence. Use playwright-cli for remaining menu destinations or other uncovered actions below.
- **Open:** use CLI `goto http://localhost:3000/teams`; require title `Teams - NHL Stats` and visible `a[href^="/player-stats/"]` team cards with names and logos.
- **Team card:** find the `Toronto Maple Leafs` link in a fresh CLI snapshot; record the number of matching cards and their targets. If repeated cards all link to `/player-stats/TOR`, click the first and require that pathname, selected dropdown value `TOR`, and player rows. Report duplicates separately; following one link does not establish unique team records.
- **Desktop menu:** at 1280×720, use CLI `resize 1280 720`, take a snapshot, and click the visible `Teams` link's reference; repeat the other statistics menu links and assert the destination path. `Scores` redirects to a dated route.
- **Mobile menu:** at 390×844, use CLI `resize 390 844`, click `Open main menu` by its snapshot reference, take another snapshot, and click the required link inside the drawer. Require the destination and the drawer becoming hidden. Reopen it before testing another item.
- **Evidence:** capture menu-open state, clicked item, destination, and selected-team state. No standalone Teams visual spec exists; preserve CLI evidence for checks outside the season tests.

## Gotchas

- Desktop and mobile links coexist in the DOM. Scope to the visible link or the drawer to avoid strict-locator ambiguity.
- This map covers public navigation only. Do not register accounts, sign in, or alter the user's session.
- Team membership and divisions depend on the selected season. Require the season query to survive team-card navigation.
