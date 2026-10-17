import { convexTest } from 'convex-test'
import authComponent from '@lupinum/better-convex-nuxt/better-auth/test'
import { afterAll, expect, it, vi } from 'vitest'
import schema from '../../convex/schema'
import { internal } from '../../convex/_generated/api'

const modules = import.meta.glob('../../convex/**/*.ts')

vi.stubEnv('SITE_URL', 'http://localhost:3000')
vi.stubEnv('CONVEX_SITE_URL', 'http://localhost:3211')
vi.stubEnv('BETTER_AUTH_SECRET', undefined)
vi.stubEnv('AUTH_SECRET', undefined)
vi.stubEnv('BETTER_AUTH_TRUSTED_ORIGINS', undefined)
vi.stubEnv('BETTER_AUTH_SECRETS', '0:isolated-auth-migration-test-secret-123456789')
vi.stubEnv('GOOGLE_CLIENT_ID', 'isolated-auth-test')
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'isolated-auth-test')

afterAll(() => vi.unstubAllEnvs())

it('supports signup, explicit signin, profile synchronization and signout', async () => {
  const { createAuth } = await import('../../convex/auth')
  const t = convexTest(schema, modules)
  authComponent.register(t, 'betterAuthV2')
  await t.action(internal.auth.ensureSigningKey, {})

  await t.run(async (ctx) => {
    const auth = await createAuth(ctx)
    const body = { email: 'auth-test@example.com', password: 'AuthMigrationPassword123!' }
    const signup = await auth.api.signUpEmail({
      body: { ...body, name: 'Auth Test' },
      asResponse: true,
    })
    expect(signup.status).toBe(200)
    expect(signup.headers.getSetCookie().join('; ')).not.toContain('session_token=')
    const user = await ctx.db.query('users').first()
    expect(user?.email).toBe(body.email)
    expect(user?.displayName).toBe('Auth Test')

    const invalid = await auth.api.signInEmail({
      body: { ...body, password: 'IncorrectPassword123!' },
      asResponse: true,
    })
    expect(invalid.status).toBe(401)

    const signin = await auth.api.signInEmail({ body, asResponse: true })
    expect(signin.status).toBe(200)
    const cookies = signin.headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ')
    expect(cookies).toContain('session_token=')
    const headers = new Headers({ cookie: cookies, origin: 'http://localhost:3000' })
    const session = await auth.api.getSession({ headers })
    expect(session?.user.email).toBe(body.email)

    await auth.api.updateUser({ headers, body: { name: 'Updated Name' } })
    expect((await ctx.db.query('users').first())?.displayName).toBe('Updated Name')

    expect((await auth.api.signOut({ headers })).success).toBe(true)
    expect(await auth.api.getSession({ headers })).toBeNull()
  })
})

it('does not admit anonymous callers as an authenticated user', async () => {
  const { auth } = await import('../../convex/auth')
  const t = convexTest(schema, modules)
  authComponent.register(t, 'betterAuthV2')
  expect(await t.run((ctx) => auth.getUser(ctx))).toBeNull()
  await expect(t.run((ctx) => auth.requireUser(ctx))).rejects.toThrow()
})
