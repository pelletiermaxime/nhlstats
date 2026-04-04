import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Signin from '~/pages/auth/signin.vue'
import Signup from '~/pages/auth/signup.vue'
import Profile from '~/pages/profile.vue'

// Mock useConvexAuth
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockRefreshAuth = vi.fn()

vi.mock('better-convex-nuxt', () => ({
  useConvexAuth: () => ({
    isAuthenticated: { value: false },
    user: { value: null },
    signIn: { email: mockSignIn },
    signUp: { email: mockSignUp },
    signOut: mockSignOut,
    refreshAuth: mockRefreshAuth,
  }),
}))

describe('Auth Pages', () => {
  describe('Signin Page', () => {
    it('renders sign in form', async () => {
      const component = await mountSuspended(Signin)
      expect(component.find('h1').text()).toContain('Sign In')
      expect(component.find('input#email').exists()).toBe(true)
      expect(component.find('input#password').exists()).toBe(true)
      expect(component.find('button[type="submit"]').exists()).toBe(true)
    })

    it('has link to sign up', async () => {
      const component = await mountSuspended(Signin)
      const signupLink = component.find('a[href="/auth/signup"]')
      expect(signupLink.exists()).toBe(true)
      expect(signupLink.text()).toContain('Sign Up')
    })
  })

  describe('Signup Page', () => {
    it('renders sign up form', async () => {
      const component = await mountSuspended(Signup)
      expect(component.find('h1').text()).toContain('Sign Up')
      expect(component.find('input#name').exists()).toBe(true)
      expect(component.find('input#email').exists()).toBe(true)
      expect(component.find('input#password').exists()).toBe(true)
      expect(component.find('button[type="submit"]').exists()).toBe(true)
    })

    it('has link to sign in', async () => {
      const component = await mountSuspended(Signup)
      const signinLink = component.find('a[href="/auth/signin"]')
      expect(signinLink.exists()).toBe(true)
      expect(signinLink.text()).toContain('Sign In')
    })
  })

  describe('Profile Page', () => {
    it('renders profile information', async () => {
      const component = await mountSuspended(Profile)
      expect(component.find('h1').text()).toContain('Your Profile')
      expect(component.find('button').text()).toContain('Sign Out')
    })

    it('displays user information sections', async () => {
      const component = await mountSuspended(Profile)
      expect(component.text()).toContain('Account Information')
    })
  })
})
