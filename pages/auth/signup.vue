<script setup lang="ts">
const router = useRouter()
const { withSeason } = useSeason()
const { client, status: authStatus } = useConvexAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

watch(
  authStatus,
  (status) => {
    if (status === 'authenticated') {
      router.push(withSeason('/player-stats'))
    }
  },
  { immediate: true },
)

async function handleSignUp() {
  error.value = null

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const { error: authError } = await client.signUp.email({
      name: name.value,
      email: email.value,
      password: password.value,
    })

    if (authError) {
      error.value = authError.message ?? 'Unable to create account.'
      return
    }
    const destination = withSeason('/auth/signin')
    await router.push({ ...destination, query: { ...destination.query, registered: '1' } })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to create account. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center px-4 pt-8 pb-12">
    <div class="max-w-md w-full space-y-8 bg-zinc-700 p-8 rounded-lg">
      <div>
        <h1 class="text-2xl font-bold text-white text-center">Sign Up</h1>
      </div>

      <form class="space-y-6" @submit.prevent="handleSignUp">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300"> Name </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Name"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-300"> Email </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300"> Password </label>
          <input
            id="password"
            v-model="password"
            type="password"
            minlength="15"
            required
            class="mt-1 block w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          <p class="mt-1 text-xs text-gray-400">Use at least 15 characters.</p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-300">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            minlength="15"
            required
            class="mt-1 block w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Signing up...' : 'Sign Up' }}
        </button>
      </form>

      <p v-if="error" class="text-red-400 text-sm text-center">
        {{ error }}
      </p>

      <p class="text-center text-sm text-gray-400">
        Already have an account?
        <SeasonLink to="/auth/signin" class="text-blue-400 hover:text-blue-300">
          Sign In
        </SeasonLink>
      </p>
    </div>
  </div>
</template>
