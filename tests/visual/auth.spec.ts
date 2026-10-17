import { test, expect, type Page } from '@playwright/test'
import { openHydratedPage } from './helpers'

async function registerAndSignIn(page: Page) {
  const email = `test-${crypto.randomUUID()}@example.com`
  const password = 'TestRegistrationPassword123!'
  await openHydratedPage(page, '/auth/signup')
  await page.fill('input#name', 'Test User')
  await page.fill('input#email', email)
  await page.fill('input#password', password)
  await page.fill('input#confirmPassword', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/auth\/signin\?registered=1$/)
  await expect(page.getByRole('status')).toHaveText('Account created. Sign in to continue.')
  await page.fill('input#email', email)
  await page.fill('input#password', password)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/player-stats$/)
  return email
}

test.describe('Authentication', () => {
  test.describe('Sign Up', () => {
    test('should display sign up page', async ({ page }) => {
      await openHydratedPage(page, '/auth/signup')
      await expect(page).toHaveTitle(/Signup/)
      await expect(page.locator('h1')).toContainText('Sign Up')
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await openHydratedPage(page, '/auth/signup')
      await page.click('button[type="submit"]')
      // HTML5 validation should prevent submission
      await expect(page).toHaveURL('/auth/signup')
    })

    test('should navigate to sign in page', async ({ page }) => {
      await openHydratedPage(page, '/auth/signup')
      await page.click('text=Sign In')
      await expect(page).toHaveURL('/auth/signin')
    })

    test('should register, sign in, display the profile, and sign out', async ({ page }) => {
      const email = await registerAndSignIn(page)
      await test.step('Show the authenticated navigation and profile', async () => {
        await expect(page.getByRole('link', { name: email }).first()).toBeVisible()
        await openHydratedPage(page, '/profile')
        await expect(page.getByRole('heading', { name: 'Your Profile' })).toBeVisible()
        await expect(page.getByText(email, { exact: true }).first()).toBeVisible()
      })
      await test.step('Sign out and protect the profile', async () => {
        await page.getByRole('button', { name: 'Sign Out' }).click()
        await expect(page).toHaveURL(/\/player-stats$/)
        await openHydratedPage(page, '/profile')
        await expect(page).toHaveURL(/\/auth\/signin/)
      })
    })
  })

  test.describe('Sign In', () => {
    test('should display sign in page', async ({ page }) => {
      await openHydratedPage(page, '/auth/signin')
      await expect(page).toHaveTitle(/Signin/)
      await expect(page.locator('h1')).toContainText('Sign In')
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await openHydratedPage(page, '/auth/signin')

      await page.fill('input#email', 'invalid@example.com')
      await page.fill('input#password', 'wrongpassword')
      const response = page.waitForResponse(
        (response) => new URL(response.url()).pathname === '/api/auth/sign-in/email',
        { timeout: test.info().project.use.navigationTimeout },
      )
      await page.click('button[type="submit"]')

      expect((await response).status()).toBe(401)
      await expect(page.getByText(/invalid email or password|invalid credentials/i)).toBeVisible()
    })

    test('should navigate to sign up page', async ({ page }) => {
      await openHydratedPage(page, '/auth/signin')
      await page.click('text=Sign Up')
      await expect(page).toHaveURL('/auth/signup')
    })
  })

  test.describe('Profile', () => {
    test('should redirect to signin when not authenticated', async ({ page }) => {
      await openHydratedPage(page, '/profile')
      // Should redirect to sign in
      await expect(page).toHaveURL(/auth\/signin/)
    })
  })

  test.describe('Navigation', () => {
    test('should show sign in/up links when not authenticated', async ({ page }) => {
      await openHydratedPage(page, '/')

      await expect(page.getByRole('link', { name: 'Sign In' }).first()).toBeVisible()
      await expect(page.getByRole('link', { name: 'Sign Up' }).first()).toBeVisible()
    })
  })
})

test('auth HTTP proxy supports registration, sessions and signout', async ({ page }) => {
  const email = `test-${crypto.randomUUID()}@example.com`
  const password = 'TestRegistrationPassword123!'
  await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' })

  async function authRequest(path: string, data?: Record<string, string>) {
    return page.evaluate(
      async ({ path, data }) => {
        const response = await fetch(
          `/api/auth/${path}`,
          data
            ? {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data),
              }
            : undefined,
        )
        const body = await response.json()
        return {
          status: response.status,
          email: typeof body?.user?.email === 'string' ? body.user.email : null,
          hasSession: body !== null,
        }
      },
      { path, data },
    )
  }

  const signup = await authRequest('sign-up/email', { name: 'Auth Proxy Test', email, password })
  expect(signup).toMatchObject({ status: 200, email })
  expect((await authRequest('sign-in/email', { email, password })).status).toBe(200)
  expect(await authRequest('get-session')).toMatchObject({ status: 200, email })

  await page.goto('/profile', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/profile$/)
  await expect(page.getByText(email, { exact: true }).first()).toBeVisible()

  expect((await authRequest('sign-out', {})).status).toBe(200)
  expect(await authRequest('get-session')).toMatchObject({ status: 200, hasSession: false })
  await page.goto('/profile', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/auth\/signin/)
})
