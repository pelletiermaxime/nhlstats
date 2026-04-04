<script setup lang="ts">
const router = useRouter()
const { signIn, isAuthenticated, refreshAuth } = useConvexAuth()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      router.push('/')
    }
  },
  { immediate: true },
)

async function handleSignIn() {
  error.value = null
  loading.value = true

  try {
    const { error: authError } = await signIn.email({
      email: email.value,
      password: password.value,
    })

    if (authError) {
      error.value = authError.message ?? null
    } else {
      await refreshAuth()
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8 bg-zinc-700 p-8 rounded-lg">
      <div>
        <h1 class="text-2xl font-bold text-white text-center">Sign In</h1>
      </div>

      <form class="space-y-6" @submit.prevent="handleSignIn">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 bg-zinc-600 border border-zinc-500 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          >
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p v-if="error" class="text-red-400 text-sm text-center">
        {{ error }}
      </p>

      <p class="text-center text-sm text-gray-400">
        Don't have an account?
        <NuxtLink to="/auth/signup" class="text-blue-400 hover:text-blue-300">
          Sign Up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
