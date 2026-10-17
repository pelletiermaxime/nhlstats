---
name: verify-nhlstats
description: Verify NHL Stats through its running Nuxt web UI using existing Playwright tests, with playwright-cli for journeys without test coverage. Use after changing standings, player or goalie stats, team navigation, scores, or season selection; capture user actions and observable results.
---

# Verify NHL Stats

Read [the feature map](features/README.md), choose the affected entry points, and prove their user-visible behavior. This is a focused verification workflow, not a full application audit.

## Launch

The user manages Nuxt and Convex. Use the existing instance at `http://localhost:3000`. Never run `dev`, `dev:nuxt`, `dev:convex`, `preview`, `convex dev`, or another server command. Do not restart services, reseed, import, deploy, or modify shared data to make verification pass.

Playwright and the doctor/season helper use `http://localhost:3000` by default. Set `PLAYWRIGHT_BASE_URL` only when targeting another existing instance, and use that same origin in playwright-cli recipes. Authentication flows require the target origin to match `SITE_URL`.

Run commands from the repository root with its installed Node/pnpm dependencies. No login is required for the mapped statistics pages. Use a fresh anonymous browser context; do not reuse the user's authenticated browser session. An isolated browser still shares the existing backend.

## Doctor

Run this read-only check before driving the app, and repeat it after unexpected navigation or data failures:

```bash
.agents/skills/verify-nhlstats/scripts/verify.mjs doctor
```

It performs a GET of `/player-stats` at the selected origin, with normal certificate validation for HTTPS, and requires HTTP success, the NHL Stats title, the Nuxt root, and the player search control. It reports the local checkout revision and dirty-file count. Those identify the inspected checkout, not the exact commit served by the externally managed process. Doctor confirms server-rendered availability only: `clientRuntimeVerified` is false. Interactive journeys additionally require client hydration and functioning controls. A failed check is a blocked prerequisite: retain the error and report it without starting a server or changing environments.

## Drive

Prefer the existing focused Playwright specs when they cover the change:

```bash
vp exec playwright test tests/visual/player-stats.spec.ts --workers=1
vp exec playwright test tests/visual/goalie-stats.spec.ts --workers=1
vp exec playwright test tests/visual/standings.spec.ts --workers=1
vp exec playwright test tests/visual/scores.spec.ts --workers=1
```

These specs compare committed screenshots against live data. A screenshot difference requires inspection; never update baselines merely to turn a failure green. A cached task result is not a fresh browser proof.

For any behavior without an existing Playwright test, use **playwright-cli**. Follow [the CLI workflow](references/playwright-cli.md) for setup, session isolation, commands, and evidence. This applies to every uncovered browser check, including manual exploration; do not substitute another browser tool or a standalone Playwright SDK script. If the CLI cannot run, retain the error and report the missing prerequisite.

Use fresh CLI snapshots to identify controls by their labels and references. Wait for the required URL, data rows, selected value, or numeric ordering; avoid arbitrary sleeps and do not use `networkidle` as proof that a subscription is ready. The feature recipes describe the actions and assertions for uncovered behavior.

For the site-wide current/previous-season flow, run:

```bash
.agents/skills/verify-nhlstats/scripts/verify.mjs seasons
```

This executes the three season Playwright journeys (desktop, scores, mobile) and retains the JSON report and browser artifacts outside the replaceable test-results directory. See [season coverage](features/seasons.md).

## Evidence

- Capture the action, resulting URL, selected controls, and visible result. A final screenshot alone is insufficient.
- For browser proof, retain screenshots and ARIA snapshots with the feature ID. For a test command, retain the command, log, exit code, and any failure artifacts outside the runner's replaceable `test-results/` directory.
- Retain CLI command output, before/after snapshots, screenshots, console/network diagnostics, and traces. Inspect diagnostics even when the requested journey passes. The season test helper retains its report and summary in a private directory. Treat traces as potentially sensitive; do not copy cookies, tokens, or environment files into reports.
- Report verified entry points, skipped paths, and blockers separately. A rendering pass does not establish correct upstream NHL data, rankings, historical completeness, authentication, or ingestion.
- Use the Season dropdown and the dedicated season journey to verify current/previous data, navigation, searches, reload, back/forward, shared URLs, and score-date synchronization. A single-season rendering pass does not establish season isolation.

## Cleanup

The test runner closes its own browser. For CLI journeys, stop tracing and close only the named session created for the run, including after a failure. Never use `close-all` or `kill-all`, stop Nuxt/Convex, clear shared storage, or delete the evidence directory. Confirm the retained logs, snapshots, screenshots, and trace survive cleanup.

## Helpers

- [`scripts/verify.mjs`](scripts/verify.mjs) is executable; its only commands are `doctor` and `seasons`. Browser journeys run existing tests or playwright-cli as specified above.
- After changing this skill, run `vp run check:quiet` as required by `AGENTS.md`. The current full browser suite includes an auth signup that creates a user; retain that limitation and do not classify the full suite as read-only. For live proof use the focused read-only journey above.
- Use `/maintain-verification-skill` when routes, controls, harnesses, or feature behavior change. Preserve the distinction between mapped recipes and journeys actually proven.
