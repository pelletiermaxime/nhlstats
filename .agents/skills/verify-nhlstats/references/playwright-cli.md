# Playwright CLI for uncovered checks

Run an existing Playwright test when it covers the behavior. Use playwright-cli for every browser check without test coverage, including exploratory journeys. A failed test remains a failed test; a CLI journey is additional evidence.

## Prerequisites and session

Run Doctor from the skill first. Check `playwright-cli --help`. If the executable is unavailable, use `vp dlx @playwright/cli@0.1.22` as the command prefix; this invocation was checked locally and does not change project dependencies. If neither invocation works, retain the error and report the CLI prerequisite instead of switching browser tools.

Use a unique session name for the run and an evidence directory outside the checkout. Do not attach to an existing session or reuse a persistent user profile. The examples below use `nhlstats-check`; replace it with your own unique name.

Create a temporary CLI JSON config in the evidence directory:

```json
{
  "browser": {
    "browserName": "chromium",
    "isolated": true,
    "contextOptions": {
      "viewport": { "width": 1280, "height": 720 }
    }
  },
  "outputDir": "/tmp/REPLACE-WITH-YOUR-EVIDENCE-DIRECTORY",
  "outputMode": "file"
}
```

Set `outputDir` to the actual evidence directory before use. The local server uses HTTP and needs no certificate or transport overrides. Do not change project Playwright configuration or server settings to make verification pass.

If the CLI expects a browser revision that is not installed, reuse the project's existing Chromium executable by setting `browser.launchOptions.executablePath` in the temporary config. Obtain its path with `node --input-type=module -e 'import { chromium } from "@playwright/test"; console.log(chromium.executablePath())'` and confirm the file exists. This reads installed browser metadata; browser control still goes through playwright-cli. Do not install another browser merely to validate this skill.

## Drive and capture

```bash
playwright-cli -s=nhlstats-check open http://localhost:3000/player-stats --config /tmp/YOUR-EVIDENCE-DIRECTORY/cli.config.json
playwright-cli -s=nhlstats-check tracing-start
playwright-cli -s=nhlstats-check snapshot
```

Read the snapshot before acting. Use its current element references for clicks, fills, and selections; refresh after navigation or a control changes the page. Do not invent references. Unique selectors such as `#team-filter`, `#player-search`, `#goalie-search`, `#season-selector`, and `#date-picker` are also available. Every command in feature recipes uses the same named session.

```bash
playwright-cli -s=nhlstats-check select '#team-filter' TOR
playwright-cli -s=nhlstats-check snapshot
playwright-cli -s=nhlstats-check screenshot --full-page --filename /tmp/YOUR-EVIDENCE-DIRECTORY/team.png
playwright-cli -s=nhlstats-check console error
playwright-cli -s=nhlstats-check requests
```

Use CLI `eval` for read-only observations and `run-code` for assertions or condition-based waits when snapshots are insufficient. Keep all browser control inside playwright-cli. A rendered table alone does not prove client hydration: require the control to change the URL, selected state, or result content. Debounced search must finish with a reduced, nonempty matching result set. Numeric sorting must be checked against the displayed column values in both directions.

Retain command output, before/after snapshots, screenshots, diagnostics, the trace, and a short result recording each action, expected outcome, observed URL/control/data state, and pass/fail. Do not turn missing rows or HTTP 502s into a pass.

## Cleanup

```bash
playwright-cli -s=nhlstats-check tracing-stop
playwright-cli -s=nhlstats-check close
```

Close only the session created for this run, including after failures. Confirm the evidence files remain. Never use `close-all`, `kill-all`, delete shared browser storage, or stop the user's Nuxt or Convex processes.
