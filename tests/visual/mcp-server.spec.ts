import { test, expect, type APIRequestContext } from '@playwright/test'

interface McpTool {
  name: string
  description?: string
}

interface McpPrompt {
  name: string
}

interface McpContent {
  type: string
  text?: string
}

interface McpResult {
  result?: {
    tools?: McpTool[]
    prompts?: McpPrompt[]
    content?: McpContent[]
    serverInfo?: {
      name: string
    }
    protocolVersion?: string
  }
}

/**
 * Parse SSE response text to extract JSON data
 */
function parseSSEResponse(text: string): unknown {
  const lines = text.split('\n')
  let data = ''
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      data += line.slice(6)
    }
  }
  return JSON.parse(data)
}

/**
 * MCP JSON-RPC request helper
 * Makes a POST request to the MCP server with proper JSON-RPC formatting
 */
async function mcpRequest(request: APIRequestContext, method: string, params?: unknown): Promise<McpResult> {
  const response = await request.post('/mcp-server', {
    data: {
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method,
      params
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    ignoreHTTPSErrors: true
  })

  expect(response.ok()).toBeTruthy()
  const text = await response.text()
  return parseSSEResponse(text) as McpResult
}

test.describe('MCP Server', () => {
  test('should list available tools', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/list')

    expect(result.result).toBeDefined()
    expect(result.result?.tools).toBeDefined()
    expect(result.result?.tools?.length).toBeGreaterThan(0)

    // Check that all expected tools exist
    const tools = result.result?.tools ?? []
    const toolNames = tools.map((t) => t.name)

    expect(toolNames).toContain('nhl-standings')
    expect(toolNames).toContain('nhl-player-stats')
    expect(toolNames).toContain('nhl-team-info')
    expect(toolNames).toContain('nhl-player-details')
    expect(toolNames).toContain('nhl-player-search')
    expect(toolNames).toContain('nhl-teams-list')

    // Verify nhl-standings description
    const standingsTool = tools.find((t) => t.name === 'nhl-standings')
    expect(standingsTool?.description?.toLowerCase()).toContain('standings')
  })

  test('should call nhl-standings tool successfully', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-standings',
      arguments: { year: 2025 }
    })

    // Check the response has content
    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()
    expect(result.result?.content?.length).toBeGreaterThan(0)

    // Parse the JSON result from the text content
    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()
    expect(textContent?.text).toBeDefined()

    // The result should be valid JSON (array of standings)
    const standings = JSON.parse(textContent!.text as string)
    expect(Array.isArray(standings)).toBe(true)

    // If data is returned, verify the structure
    if (standings.length > 0) {
      const firstTeam = standings[0]
      expect(firstTeam).toHaveProperty('team')
      expect(firstTeam).toHaveProperty('division')
      expect(firstTeam).toHaveProperty('points')
      expect(firstTeam).toHaveProperty('gamesPlayed')
    }
  })

  test('should list available prompts', async ({ request }) => {
    const result = await mcpRequest(request, 'prompts/list')

    expect(result.result).toBeDefined()
    expect(result.result?.prompts).toBeDefined()
    expect(result.result?.prompts?.length).toBeGreaterThan(0)

    // Check that all expected prompts exist
    const prompts = result.result?.prompts ?? []
    const promptNames = prompts.map((p) => p.name)

    expect(promptNames).toContain('get-standings')
    expect(promptNames).toContain('get-player-stats')
    expect(promptNames).toContain('get-team-info')
    expect(promptNames).toContain('get-player-details')
    expect(promptNames).toContain('get-teams-list')
    expect(promptNames).toContain('search-players')
  })

  test('should provide server info on initialize', async ({ request }) => {
    const result = await mcpRequest(request, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.protocolVersion).toBeDefined()
    expect(result.result?.serverInfo).toBeDefined()
    expect(result.result?.serverInfo?.name).toBe('nhlstats')
  })

  test('should call nhl-player-stats tool successfully', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-player-stats',
      arguments: { year: 2026, sortBy: 'points', limit: 10 }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()
    expect(result.result?.content?.length).toBeGreaterThan(0)

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()
    expect(textContent?.text).toBeDefined()

    // The result should be valid JSON
    const data = JSON.parse(textContent!.text as string)
    expect(data).toHaveProperty('year')
    expect(data).toHaveProperty('sortBy')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('players')
    expect(Array.isArray(data.players)).toBe(true)

    // If players are returned, verify structure
    if (data.players.length > 0) {
      const firstPlayer = data.players[0]
      expect(firstPlayer).toHaveProperty('playerId')
      expect(firstPlayer).toHaveProperty('name')
      expect(firstPlayer).toHaveProperty('position')
      expect(firstPlayer).toHaveProperty('team')
      expect(firstPlayer).toHaveProperty('points')
      expect(firstPlayer).toHaveProperty('goals')
      expect(firstPlayer).toHaveProperty('assists')
    }
  })

  test('should call nhl-player-stats with team filter', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-player-stats',
      arguments: { year: 2026, team: 'MTL', limit: 5 }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()

    const data = JSON.parse(textContent!.text as string)
    expect(data.players.length).toBeLessThanOrEqual(5)
  })

  test('should call nhl-team-info tool successfully', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-team-info',
      arguments: { team: 'MTL', year: 2026 }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()
    expect(result.result?.content?.length).toBeGreaterThan(0)

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()
    expect(textContent?.text).toBeDefined()

    const data = JSON.parse(textContent!.text as string)
    expect(data).toHaveProperty('team')
    expect(data).toHaveProperty('division')
    expect(data).toHaveProperty('standings')
    expect(data).toHaveProperty('players')

    expect(data.team).toHaveProperty('name')
    expect(data.team).toHaveProperty('city')
    expect(data.team).toHaveProperty('shortName')

    expect(Array.isArray(data.players)).toBe(true)
  })

  test('should call nhl-team-info with invalid team', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-team-info',
      arguments: { team: 'INVALID', year: 2026 }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()
    expect(textContent?.text).toContain('not found')
  })

  test('should call nhl-player-details tool successfully', async ({ request }) => {
    // Using Connor McDavid's player ID (8478402) as a known player
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-player-details',
      arguments: { playerId: 8478402, year: 2026 }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()

    // If player found, verify structure
    const text = textContent?.text ?? ''
    if (!text.includes('not found')) {
      const data = JSON.parse(text)
      expect(data).toHaveProperty('playerId')
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('position')
      expect(data).toHaveProperty('team')
      expect(data).toHaveProperty('season')
      expect(data).toHaveProperty('scoring')
      expect(data).toHaveProperty('advanced')
    }
  })

  test('should call nhl-teams-list tool successfully', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-teams-list',
      arguments: {}
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()

    const data = JSON.parse(textContent!.text as string)
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('teams')
    expect(Array.isArray(data.teams)).toBe(true)
    expect(data.teams.length).toBeGreaterThan(0)

    const firstTeam = data.teams[0]
    expect(firstTeam).toHaveProperty('name')
    expect(firstTeam).toHaveProperty('city')
    expect(firstTeam).toHaveProperty('shortName')
  })

  test('should call nhl-teams-list with conference filter', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-teams-list',
      arguments: { conference: 'EAST' }
    })

    expect(result.result).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()

    const data = JSON.parse(textContent!.text as string)
    expect(data.conference).toBe('EAST')
    expect(data.teams.length).toBeGreaterThan(0)

    // All teams should be from Eastern Conference
    for (const team of data.teams) {
      expect(team.conference).toBe('EAST')
    }
  })

  test('should call nhl-player-search tool successfully', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-player-search',
      arguments: { query: 'Connor', limit: 10 }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()

    const data = JSON.parse(textContent!.text as string)
    expect(data).toHaveProperty('query')
    expect(data).toHaveProperty('team')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('players')
    expect(Array.isArray(data.players)).toBe(true)

    // If players are returned, verify structure
    if (data.players.length > 0) {
      const firstPlayer = data.players[0]
      expect(firstPlayer).toHaveProperty('playerId')
      expect(firstPlayer).toHaveProperty('name')
      expect(firstPlayer).toHaveProperty('position')
      expect(firstPlayer).toHaveProperty('team')
      expect(firstPlayer).toHaveProperty('goals')
      expect(firstPlayer).toHaveProperty('assists')
      expect(firstPlayer).toHaveProperty('points')
    }
  })

  test('should call nhl-player-search with team filter', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-player-search',
      arguments: { query: 'Connor', team: 'EDM', limit: 5 }
    })

    expect(result.result).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()

    const data = JSON.parse(textContent!.text as string)
    expect(data.query).toBe('Connor')
    expect(data.team).toBe('EDM')
  })

  test('should call nhl-player-search with invalid team', async ({ request }) => {
    const result = await mcpRequest(request, 'tools/call', {
      name: 'nhl-player-search',
      arguments: { query: 'Connor', team: 'INVALID' }
    })

    expect(result.result).toBeDefined()
    expect(result.result?.content).toBeDefined()

    const textContent = result.result?.content?.find((c: McpContent) => c.type === 'text')
    expect(textContent).toBeDefined()
    expect(textContent?.text).toContain('not found')
  })
})
