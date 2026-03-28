# AGENTS.md

This file contains guidelines for agentic coding agents working in this repository.

## Project Overview

NHL Stats v2 Frontend - A Nuxt 4 application displaying NHL standings, team statistics, and player stats. Built with Vue 3, TypeScript, UnoCSS, and Convex backend.

## Build/Lint/Test Commands

```bash
# Development
pnpm run dev              # Start dev server [Please never do this as I already run it manually]

# Build & Preview
pnpm run build            # Build for production
pnpm run preview          # Preview production build

# Testing
pnpm run test             # Run all tests (unit + integration)
pnpm run test:unit        # Run Vitest unit tests
pnpm run test:integration # Run Playwright integration tests

# Run single test file with Vitest
pnpm exec vitest run path/to/test.file.ts

# Run single test with Playwright
pnpm exec playwright test path/to/test.spec.ts

# Linting
pnpm run lint             # Run ESLint on all files
pnpm run typecheck        # Run TypeScript type checking (via nuxt typecheck)
```

## Code Style Guidelines

### General Principles

- No comments unless explaining complex business logic
- Avoid code explanation summaries unless requested
- Keep responses concise on command line
- Never commit changes unless explicitly asked

### TypeScript

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
  title: 'Standings'
})
```

- Use `useConvexQuery()` from `better-convex-nuxt` for data fetching in pages:

```typescript
import { api } from "../convex/_generated/api";

const { data: standings } = await useConvexQuery(
  api.standings.getCurrentStandingsWithTeams,
  {}
)
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
  statusMessage: 'Failed to fetch data'
})
```

### Convex Backend

- Uses `better-convex-nuxt` module for Vue/Nuxt integration
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
import { query } from "./_generated/server";

export const getTeams = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    return teams;
  },
});
```

### Styling

- Use UnoCSS utility classes in templates
- See `uno.config.ts` for shortcuts like `menu-active`, `title`
- Use Tailwind-compatible classes (UnoCSS presetUno)
- Avoid custom CSS unless necessary

### File Organization

```
├── app.vue              # App entry point
├── components/          # Vue components (auto-imported)
├── convex/             # Convex backend functions
├── layouts/            # Nuxt layouts
├── pages/              # Route pages (auto-routed)
├── server/api/         # Nitro API routes
├── types/              # TypeScript type definitions
└── uno.config.ts       # UnoCSS configuration
```

### Nuxt Configuration

- Default home route redirects to `/player-stats`
- SWR caching enabled with varying durations per route
- Deployed to Cloudflare Pages via `nitro.preset: 'cloudflare_pages'`
- Runtime config in `public.apiUrl` for external API

### Testing

- Unit tests: Vitest, place in same directory as code
- Integration tests: Playwright, place in `tests/` directory
- Test files: `*.test.ts` or `*.spec.ts`

### Before Submitting

1. Run `pnpm run lint` to check code quality
2. Run `pnpm run typecheck` to verify TypeScript
