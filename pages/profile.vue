<script setup lang="ts">
definePageMeta({
  convexAuth: true,
})

const { user, signOut } = useConvexAuth()
const router = useRouter()

async function handleSignOut() {
  await signOut()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-zinc-800 py-12 px-4">
    <div class="max-w-2xl mx-auto bg-zinc-700 rounded-lg p-8">
      <h1 class="text-3xl font-bold text-white mb-8">Your Profile</h1>

      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <div v-if="user?.image" class="w-20 h-20 rounded-full overflow-hidden">
            <img :src="user.image" alt="Profile" class="w-full h-full object-cover">
          </div>
          <div v-else class="w-20 h-20 rounded-full bg-zinc-600 flex items-center justify-center text-3xl text-white">
            {{ user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>

          <div>
            <h2 class="text-xl font-semibold text-white">
              {{ user?.name || 'User' }}
            </h2>
            <p class="text-gray-400">{{ user?.email }}</p>
          </div>
        </div>

        <div class="border-t border-zinc-600 pt-6">
          <h3 class="text-lg font-medium text-white mb-4">Account Information</h3>
          <dl class="space-y-3">
            <div class="flex">
              <dt class="w-32 text-gray-400">Name:</dt>
              <dd class="text-white">{{ user?.name || 'Not set' }}</dd>
            </div>
            <div class="flex">
              <dt class="w-32 text-gray-400">Email:</dt>
              <dd class="text-white">{{ user?.email || 'Not set' }}</dd>
            </div>
          </dl>
        </div>

        <div class="border-t border-zinc-600 pt-6">
          <button
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            @click="handleSignOut"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
