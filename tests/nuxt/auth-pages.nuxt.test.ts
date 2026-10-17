import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useNuxtApp } from '#app'
import Signin from '~/pages/auth/signin.vue'
import Signup from '~/pages/auth/signup.vue'
import Profile from '~/pages/profile.vue'

// Mock useConvexAuth
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()

mockNuxtImport('useConvexAuth', () => () => ({
  status: ref('anonymous'),
  user: ref(null),
  client: {
    signIn: { email: mockSignIn },
    signUp: { email: mockSignUp },
    signOut: mockSignOut,
  },
}))

describe('Auth Pages', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.restoreAllMocks())
  describe('Signin Page', () => {
    it('renders sign in form', async () => {
      const component = await mountSuspended(Signin)
      expect(component.find('h1').text()).toContain('Sign In')
      expect(component.find('input#email').exists()).toBe(true)
      expect(component.find('input#password').exists()).toBe(true)
      expect(component.find('button[type="submit"]').exists()).toBe(true)
    })

    it('displays a rejected sign-in without navigating', async () => {
      mockSignIn.mockResolvedValue({ error: { message: 'Invalid email or password' } })
      const component = await mountSuspended(Signin, { route: '/auth/signin' })
      const push = vi.spyOn(useNuxtApp().$router, 'push').mockResolvedValue()
      await component.find('input#email').setValue('user@example.com')
      await component.find('input#password').setValue('InvalidPassword123!')
      await component.find('form').trigger('submit')
      await flushPromises()
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'InvalidPassword123!',
      })
      expect(component.text()).toContain('Invalid email or password')
      expect(push).not.toHaveBeenCalled()
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

    it('sends a newly registered user to sign in while preserving the season', async () => {
      mockSignUp.mockResolvedValue({ error: null })
      const component = await mountSuspended(Signup, {
        route: '/auth/signup?season=20252026',
      })
      const push = vi.spyOn(useNuxtApp().$router, 'push').mockResolvedValue()
      await component.find('input#name').setValue('New User')
      await component.find('input#email').setValue('user@example.com')
      await component.find('input#password').setValue('RegistrationPassword123!')
      await component.find('input#confirmPassword').setValue('RegistrationPassword123!')
      expect(component.find('input#password').attributes('minlength')).toBe('15')
      await component.find('form').trigger('submit')
      await flushPromises()
      expect(mockSignUp).toHaveBeenCalledWith({
        name: 'New User',
        email: 'user@example.com',
        password: 'RegistrationPassword123!',
      })
      expect(push).toHaveBeenCalledWith({
        path: '/auth/signin',
        query: { season: '20252026', registered: '1' },
      })
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
