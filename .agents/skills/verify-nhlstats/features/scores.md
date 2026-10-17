# Scores

Users can open today's scores, choose a date, move to adjacent days, and read available game cards.

## Sub-features

- `scores-today` redirects the Scores entry to today's Eastern date.
- `scores-date` selects a date through the picker or a dated URL.
- `scores-adjacent` moves forward/back by one calendar day.
- `scores-cards` displays the available live, final, or upcoming games.

## How to get to it (user POV)

- Choose `Scores` in the desktop menu or mobile drawer, or open `/scores`.
- Open `/scores/2026-04-25` as the existing screenshot fixture date.
- Use the date picker and the `Previous day` / `Next day` buttons.

## Driving it with Playwright

Preconditions: Doctor passes. For a populated-card claim, use a date with games already stored; do not import missing fixtures.

- **Existing tests:** run `tests/visual/scores.spec.ts` for the fixture screenshot and `tests/visual/seasons.spec.ts` for date/season controls. Use playwright-cli for uncovered dates, cards, or controls.
- **Today:** use CLI `goto http://localhost:3000/scores`; require the pathname `/scores/` followed by `new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })`. Re-evaluate if the run crosses Eastern midnight.
- **Picker:** use CLI `fill '#date-picker' 2026-04-25`; require pathname `/scores/2026-04-25`, input value `2026-04-25`, and the matching date heading. If the browser has not committed the change, blur the input with CLI `press Tab`.
- **Adjacent days:** click `Previous day` using its fresh snapshot reference or CLI `click 'button[title="Previous day"]'` and require `/scores/2026-04-24`; click `Next day` and require the starting date again.
- **Cards:** inspect the sections `Live Games`, `Final`, and `Upcoming` when present. Capture team names/logos, scores or start time, and state badges. An empty message proves only that the app returned no stored games for that date.
- **Evidence:** save the selected date before/after each action and game-card screenshots/ARIA snapshots. Existing screenshot coverage: `vp exec playwright test tests/visual/scores.spec.ts --workers=1`.

## Gotchas

- Browser-local dates and Eastern dates can differ. Today is defined by the app's Eastern timezone.
- Missing stored games cannot establish that the NHL scheduled no games.
- Cards update from live data; screenshots alone do not prove the ingestion cadence or upstream state mapping.
