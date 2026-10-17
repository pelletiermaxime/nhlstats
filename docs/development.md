# Development

## Local setup

Install [VitePlus](https://viteplus.dev/guide/) and the Node version pinned in `.node-version`, then install dependencies:

```bash
vp install --frozen-lockfile
```

The developer starts and manages the local servers. The existing command retains Turbo's TUI for Nuxt and Convex:

```bash
pnpm run dev
```

The site runs directly at `http://localhost:3000`. Nuxt binds to localhost and
exits if port 3000 is occupied. Set `SITE_URL=http://localhost:3000` in
`.env.local` and in the development Convex deployment for authentication.

## Checks and formatting

```bash
vp check                  # Oxfmt formatting and Oxlint rules
vp fmt                    # Apply formatting
vp run typecheck          # Nuxt/Vue type checking
vp test                   # All Nuxt and Convex tests
vp test --project nuxt    # Nuxt component and utility tests
vp test --project convex  # Convex backend tests
vp test --ui              # Vitest UI
vp run test:browser       # Playwright tests against the running local site
vp run check              # Full validation through Vite Task
vp run check:quiet        # Full validation with grouped logs
```

VitePlus owns linting, formatting, and the test runner. Nuxt tests retain upstream `vitest` imports as required by `@nuxt/test-utils`; the catalog pins them to VitePlus's bundled version. Type checking uses `nuxt typecheck --dotenv .env.local --checker golar` with `@golar/vue` to check Vue templates and Nuxt's generated types through the native TypeScript compiler. The command loads the same local environment as the dev server. Nuxt tests isolate both their build output and generated types in `node_modules/.cache/nuxt/test`. `vp exec tsc` runs TypeScript 7. The project has no direct TypeScript 6 dependency; some third-party tools still install it transitively for their own compiler API compatibility. Oxlint uses its default rules; the lint configuration only selects which project files to check. The full check includes Playwright and requires the developer-managed site; CI runs the checks that do not need that server. Vite Task cancels unfinished checks when another check fails; an exit code of 137 in that situation does not establish an out-of-memory failure.

Formatting covers frontend source, tests, configuration, and project documentation. Generated Convex files, public assets, vendored agent skills, and the independently managed desktop package are excluded. Browser tests use live data and are not cached. Follow the project verification skill for focused tests, or playwright-cli for uncovered browser behavior.

Browser tests and the verification helper use `http://localhost:3000` by default.
To target another existing instance, set `PLAYWRIGHT_BASE_URL`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3001 vp run test:browser
```

Authentication flows require the test URL to match the configured `SITE_URL`.

## Building

Nuxt remains responsible for application builds and previews:

```bash
vp run build
vp run preview
```

`vp dev`, `vp build`, and `vp preview` are Vite's built-in commands; use the project scripts above for this Nuxt application. The independent Bun/Electrobun desktop release workflow is unchanged.

## Authentication

See [authentication setup](authentication.md) for environment variables, signing keys, and account configuration.
