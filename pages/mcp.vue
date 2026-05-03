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

    <!-- Tools Section -->
    <div class="bg-zinc-700 rounded-lg shadow-md p-8 mb-8">
      <h2 class="text-2xl font-bold mb-4 text-white">Available Tools</h2>
      <p class="text-zinc-300 mb-4">
        This MCP server provides access to comprehensive NHL statistics through the following tools:
      </p>

      <div class="space-y-4">
        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-standings</h3>
          <p class="text-zinc-300 text-sm">Get NHL standings for a given year</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: year (number)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-player-stats</h3>
          <p class="text-zinc-300 text-sm">Get player statistics with filtering options</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: year (optional), team (optional), sortBy (optional: points, goals, assists), limit (optional, default 50, max 100)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-team-info</h3>
          <p class="text-zinc-300 text-sm">Get detailed information about a specific team including standings and all players</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: team (required, short name like "MTL"), year (optional)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-player-details</h3>
          <p class="text-zinc-300 text-sm">Get detailed stats for a specific player by ID</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: playerId (required), year (optional)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-player-search</h3>
          <p class="text-zinc-300 text-sm">Search for NHL players by name with optional team filtering</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: query (required), team (optional), year (optional), limit (optional, default 20, max 50)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-teams-list</h3>
          <p class="text-zinc-300 text-sm">Get list of all NHL teams with optional filtering</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: conference (optional: EAST, WEST), division (optional)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-scores</h3>
          <p class="text-zinc-300 text-sm">Get NHL scores for a specific date</p>
          <p class="text-zinc-400 text-xs mt-1">Parameters: date (optional, defaults to today)</p>
        </div>

        <div class="border-l-4 border-zinc-500 pl-4">
          <h3 class="font-semibold text-white">nhl-todays-games</h3>
          <p class="text-zinc-300 text-sm">Get today's NHL games with scores and live status</p>
          <p class="text-zinc-400 text-xs mt-1">No parameters required</p>
        </div>
      </div>

      <div class="text-zinc-300 mt-6 text-sm">
        Your MCP client will automatically discover and present available tools.
      </div>
    </div>

    <!-- Example Queries -->
    <div class="bg-zinc-700 rounded-lg shadow-md p-8">
      <h2 class="text-2xl font-bold mb-4 text-white">Example Queries</h2>
      <div class="space-y-3 text-zinc-300 text-sm">
        <p>"What are the current NHL standings?"</p>
        <p>"Show me the top 10 goal scorers this season"</p>
        <p>"List all teams in the Eastern Conference"</p>
        <p>"Tell me about the Toronto Maple Leafs"</p>
        <p>"Get player stats for the Canadiens sorted by goals"</p>
        <p>"Search for players named Connor"</p>
        <p>"Find all players on the Oilers named McDavid"</p>
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
