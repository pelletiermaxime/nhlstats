<template>
  <div class="max-w-4xl mx-auto px-6 py-12">
    <!-- Quick Start Card -->
    <div class="bg-zinc-700 rounded-lg shadow-md p-8 mb-8 border-l-4 border-zinc-500">
      <h2 class="text-2xl font-bold mb-4 text-white">Configuration</h2>
      <p class="text-zinc-300 mb-4">Add this to your MCP client configuration:</p>
      <pre class="bg-black text-white p-4 rounded overflow-x-auto font-mono text-sm">
{
  "mcpServers": {
    "nhlstats": {
      "url": "https://nhlstats.org/mcp-server"
    }
  }
}</pre
      >
    </div>

    <!-- Steps -->
    <div class="space-y-6 mb-12">
      <h2 class="text-2xl font-bold mb-6 text-white">Setup Instructions</h2>

      <div class="flex gap-4">
        <div
          class="flex-shrink-0 w-8 h-8 bg-zinc-500 text-white rounded-full flex items-center justify-center font-bold"
        >
          1
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-lg text-white">Locate Your MCP Configuration File</h3>
          <p class="text-zinc-300">
            Find your MCP client's configuration file (location varies by client)
          </p>
        </div>
      </div>

      <div class="flex gap-4">
        <div
          class="flex-shrink-0 w-8 h-8 bg-zinc-500 text-white rounded-full flex items-center justify-center font-bold"
        >
          2
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-lg text-white">Add Server Configuration</h3>
          <p class="text-zinc-300">
            Copy configuration above and add it to your mcpServers section
          </p>
        </div>
      </div>

      <div class="flex gap-4">
        <div
          class="flex-shrink-0 w-8 h-8 bg-zinc-500 text-white rounded-full flex items-center justify-center font-bold"
        >
          3
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-lg text-white">Restart Your MCP Client</h3>
          <p class="text-zinc-300">Restart your MCP client to load nhlstats server</p>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="bg-zinc-700 rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold mb-4 text-white">What You Get</h2>
      <p class="text-zinc-300 mb-4">
        This MCP server provides access to comprehensive NHL statistics including:
      </p>
      <ul class="list-disc list-inside text-zinc-300 space-y-2">
        <li>Current season standings</li>
      </ul>
      <div class="text-zinc-300 mt-4">
        Your MCP client will automatically discover and present available tools.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page metadata
definePageMeta({})

useHead({
  title: 'MCP Configuration'
})
</script>
