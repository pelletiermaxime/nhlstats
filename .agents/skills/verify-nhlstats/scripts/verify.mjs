#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { chmod, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url))
const command = process.argv[2]

function doctor() {
  const html = execFileSync('curl', [
    '--fail', '--silent', '--show-error', '--max-time', '20',
    '--proto', '=http,https', `${ORIGIN}/player-stats`,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  if (!/<title>Player Stats - NHL Stats<\/title>/.test(html)
    || !html.includes('id="__nuxt"') || !html.includes('id="player-search"')) {
    throw new Error('Doctor failed: expected the NHL Stats player-stats app at the configured local origin')
  }
  return {
    origin: ORIGIN,
    title: 'Player Stats - NHL Stats',
    checkedAt: new Date().toISOString(),
    checkoutCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
    checkoutDirtyFiles: execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean).length,
    servedCommitVerified: false,
    clientRuntimeVerified: false,
    node: process.version,
  }
}

async function verifySeasons() {
  const artifacts = await mkdtemp(join(tmpdir(), 'nhlstats-seasons-verify-'))
  await chmod(artifacts, 0o700)
  const summary = { feature: 'seasons', status: 'running', artifacts }
  console.log(`Evidence: ${artifacts}`)
  try {
    summary.doctor = doctor()
    const output = execFileSync('vp', [
      'exec', 'playwright', 'test', 'tests/visual/seasons.spec.ts', '--workers=1', '--reporter=json', '--output', join(artifacts, 'browser'),
    ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
    await writeFile(join(artifacts, 'report.json'), output, { mode: 0o600 })
    const report = JSON.parse(output)
    summary.tests = report.stats
    summary.status = report.stats.expected === 3 && report.stats.unexpected === 0 && report.stats.skipped === 0 && report.stats.flaky === 0 ? 'passed' : 'failed'
  } catch (error) {
    summary.status = 'failed'
    summary.error = error instanceof Error ? error.message : String(error)
    if (error.stdout) await writeFile(join(artifacts, 'report.json'), error.stdout, { mode: 0o600 })
    if (error.stderr) await writeFile(join(artifacts, 'runner.log'), error.stderr, { mode: 0o600 })
  } finally {
    summary.cleanup = 'Playwright owns browser cleanup; existing services untouched'
    await writeFile(join(artifacts, 'summary.json'), JSON.stringify(summary, null, 2) + '\n', { mode: 0o600 })
    if (summary.status !== 'passed') process.exitCode = 1
    console.log(JSON.stringify({ status: summary.status, artifacts, tests: summary.tests, error: summary.error }))
  }
}

try {
  if (command === 'doctor') console.log(JSON.stringify(doctor(), null, 2))
  else if (command === 'seasons') await verifySeasons()
  else throw new Error('Usage: .agents/skills/verify-nhlstats/scripts/verify.mjs doctor|seasons')
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
