# Authentication

The Nuxt integration uses `@lupinum/better-convex-nuxt@1.0.0-rc.6`. Keep
`better-auth`, `@better-auth/core`, and `@better-auth/oauth-provider` pinned to
`1.7.7`, the release candidate's supported versions.

Auth now uses the fresh `betterAuthV2` Convex component. Accounts and sessions
from the old `betterAuth` component are not migrated; register a new account.
The application's existing NHL data is independent of this change.

Set `SITE_URL` to the application's public origin in both Nuxt and Convex.
Remove legacy `BETTER_AUTH_SECRET` and `AUTH_SECRET` variables.
Configure `BETTER_AUTH_SECRETS` in Convex as `0:<random secret of at least 32 characters>`.
Set the same random `BCN_AUTH_PROXY_IP_SECRET` in Nuxt and Convex. These values
are server secrets and must never be committed or exposed in public runtime config.
Google sign-in continues to use Convex's `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Local development uses `http://localhost:3000` for `SITE_URL` in both Nuxt and
the development Convex deployment. Leave `BCN_AUTH_TRUSTED_CLIENT_IP_HEADER`
empty when connecting directly to the localhost server.
Production uses Cloudflare's `cf-connecting-ip`; another ingress must explicitly
set `BCN_AUTH_TRUSTED_CLIENT_IP_HEADER` to its own trusted header.
After the backend is deployed, initialize its signing key once with
`vp exec convex run auth:ensureSigningKey`. Use `--prod` only for an intentional
production rollout. A daily cron prunes retired signing keys.

Password registration requires at least 15 characters and sends the user to
sign in after account creation. Email verification remains disabled, matching
the previous setup; enabling verification requires a real email delivery hook.
