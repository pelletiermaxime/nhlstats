# AGENTS.md

This file contains guidelines for agentic coding agents working in this repository.

## Project Overview

NHL Stats v2 Frontend - A Nuxt 4 application displaying NHL standings, team statistics, and player stats. Built with Vue 3, TypeScript, UnoCSS, and Convex backend.

## Build/Lint/Test Commands

```bash
# Development
pnpm run dev              # Start dev server [Please never do this as I already run it manually]

# Build & Preview
vp run build            # Build for production
vp run preview          # Preview production build

# Testing
vp test             # Run all tests (DOM snapshots + unit)
vp run test:browser     # Run browser-based visual regression tests
vp test --ui          # Run tests with Vitest UI

# Run single test file
vp test path/to/test.file.ts

# Formatting and linting
vp fmt                    # Format project files with Oxfmt
vp fmt --check            # Check formatting without writing
vp check                  # VitePlus formatting and lint checks
vp lint             # Run Oxlint on all files
vp run typecheck        # Run native TypeScript/Vue checks through Nuxt and Golar
```

Please _NEVER_ start the dev server or the nuxt server unless asked to.
It's the user's job to start it and the website should be running at all time at http://localhost:3000.

## Code Style Guidelines

### General Principles

- No comments unless explaining complex business logic
- Avoid code explanation summaries unless requested
- Keep responses concise on command line
- Never commit changes unless explicitly asked

### TypeScript

- `vp run typecheck` uses Nuxt with Golar and `@golar/vue` for native Vue template and TypeScript checks.
- `vp exec tsc` runs TypeScript 7 through `@typescript/native`; there is no direct TypeScript 6 dependency. Third-party tools may still install it transitively.
- Use TypeScript interfaces for all type definitions (see `types/teams.ts`)
- Prefer explicit types over `any`
- Use `Record<K, T>` for dictionary types
- Use optional properties with `?` when appropriate
- Define props in Vue components using TypeScript:

```typescript
defineProps<{
  standings: Standing[]
}>()
```

### Naming Conventions

- **Files**: kebab-case for Vue components (`stats-block.vue`), camelCase for TypeScript files
- **Variables/functions**: camelCase (`getTeams`, `standingsData`)
- **Types/Interfaces**: PascalCase (`Standing`, `Team`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Vue components**: Auto-imported by directory structure, use descriptive names

### Vue Components

- Use `<script setup lang="ts">` for all components
- Use Nuxt auto-imports for composables and utilities
- Import types from `~/types/teams` or similar
- Define page metadata with `definePageMeta()`:

```typescript
definePageMeta({
  title: 'Standings',
})
```

- Use `useConvexQuery()` from `@lupinum/better-convex-nuxt` for data fetching in pages:

```typescript
import { api } from '../convex/_generated/api'

const { data: standings } = await useConvexQuery(api.standings.getCurrentStandingsWithTeams, {})
```

### Imports

- Use `~` alias for imports from project root (`~/types/teams`)
- Use Nuxt auto-imports (no need to import `ref`, `computed`, `useFetch`, etc.)
- Import types explicitly with `import type { Standing } from '~/types/teams'`

### Error Handling

- Convex errors are handled automatically by `useConvexQuery()`
- Use try/catch for async operations when needed
- Use Nuxt's `createError()` for fatal errors:

```typescript
throw createError({
  statusCode: 500,
  statusMessage: 'Failed to fetch data',
})
```

### Convex Backend

- Uses `@lupinum/better-convex-nuxt` module for Vue/Nuxt integration
- Place functions in `convex/` directory
- Export query/mutation functions using `query({})` or `mutation({})` from `./_generated/server`
- Access database via `ctx.db`
- Use `v` validator from `convex/values` for schema definition
- Define indexes on frequently queried fields

**Convex Development Server:**

- In the **main working directory**: Convex dev server runs externally; don't start it manually
- In **worktrees**: If schema changes need to be compiled (e.g., `_generated/` is stale), you may run `convex dev` in the worktree to regenerate types. Start it with `cd /home/maximep/projects/nhlstats-v2-frontend && pnpm convex dev` (run from project root to share the same database). When done, stop it with Ctrl+C.

Example (see `convex/teams.ts`):

```typescript
import { query } from './_generated/server'

export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query('teams').collect()
    return teams
  },
})
```

### Styling

- Use UnoCSS utility classes in templates
- See `uno.config.ts` for shortcuts like `menu-active`, `title`
- Use Tailwind-compatible classes (UnoCSS presetUno)
- Avoid custom CSS unless necessary

## Testing

Uses VitePlus's bundled Vitest with `@nuxt/test-utils` for first-class Nuxt testing support. Root `vite.config.ts` selects the Nuxt and Convex projects in `tests/nuxt/vitest.config.ts` and `tests/convex/vitest.config.ts`. Keep upstream `vitest` imports for Nuxt transform compatibility; the VitePlus catalog pins one shared version. Use `vp test --project nuxt` or `vp test --project convex` to select an environment. Nuxt tests keep their generated build output separate from the manually managed dev server.

**Test Structure:**

```text
tests/
├── convex/             # Convex backend tests (edge runtime)
├── nuxt/               # Tests requiring Nuxt runtime environment
│   ├── components/     # Component tests using `mountSuspended`
│   └── unit/           # Unit tests for utilities
└── visual/             # Visual regression (browser mode, skipped by default)
```

**Test Commands:**

```bash
vp test             # Run all tests
vp run test:browser     # Run browser-based visual regression tests
vp test --ui          # Run tests with Vitest UI
```

**Test Location Conventions:**

This codebase uses a **centralized** test structure. All tests live under `tests/` with suffixes indicating their environment:

- `tests/nuxt/**/*.nuxt.test.ts` - Vitest tests requiring Nuxt runtime (components, utilities)
- `tests/visual/**/*.spec.ts` - Playwright visual regression tests

```typescript
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MyComponent from '~/components/MyComponent.vue'

it('renders correctly', async () => {
  const component = await mountSuspended(MyComponent, { props: { ... } })
  expect(component.html()).toMatchSnapshot()
})
```

- Test files (centralized pattern): `*.nuxt.test.ts` or `*.nuxt.spec.ts` for Nuxt environment
- Components get auto-imports, Nuxt composables, and plugin injections
- Use `mockNuxtImport` to mock auto-imported functions
- Use `registerEndpoint` to mock Nitro API endpoints

**Unit Tests:**
Place utility function tests in `tests/nuxt/unit/`. These run in the Nuxt environment but don't require component mounting.

**Visual Regression Tests:**
Located in `tests/visual/` and use Playwright's test runner directly (not Vitest).

These tests take full-page screenshots in Chromium and compare against baselines using `toHaveScreenshot()`.

To run visual tests:

```bash
# Terminal: Run visual tests (dev server must be running on localhost:3000)
vp run test:browser

# Update baselines after intentional UI changes
vp run test:browser:update
```

**Visual Test Configuration:**

- `playwright.config.ts` - Playwright configuration
- Screenshots saved in `tests/visual/*.spec.ts-snapshots/`
- Animations disabled for stable screenshots
- 1% pixel difference tolerance (`maxDiffPixelRatio: 0.01`)

**To update baselines** when UI intentionally changes:

```bash
vp run test:browser:update
```

Note: Visual tests use the developer-managed Nuxt server at `http://localhost:3000`. The `dev:nuxt` script fixes the host and port, and `playwright.config.ts` uses that URL by default. Set `PLAYWRIGHT_BASE_URL` to target another running instance; authentication requires its origin to match `SITE_URL`.

**Git LFS for Screenshots:**
Git LFS is configured (see `.gitattributes`) to track PNG screenshots in `tests/visual/`. This prevents snapshot bloat in the main repository.

**Current LFS-tracked files:**

- `tests/visual/**/*.png` - Visual regression baselines

### Run after every change

Run the `check` task to run all validation:

```bash
vp run check        # Full output
vp run check:quiet  # Grouped output (for agents)
```

This uses Vite Task to run VitePlus format/lint checks, Nuxt typecheck, both test projects, and browser tests in parallel. Browser checks are not cached. Turbo remains responsible for the development TUI only.

To run individual checks:

- `vp lint` - Check code quality with Oxlint
- `vp run typecheck` - Verify TypeScript types
- `vp test` - Run unit tests
- `vp run test:browser` - Run visual regression tests

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
