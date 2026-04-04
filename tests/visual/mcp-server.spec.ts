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

    // Check that nhl-standings tool exists
    const standingsTool = result.result?.tools?.find((t) => t.name === 'nhl-standings')
    expect(standingsTool).toBeDefined()
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

    // Check that get-standings prompt exists
    const standingsPrompt = result.result?.prompts?.find((p) => p.name === 'get-standings')
    expect(standingsPrompt).toBeDefined()
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
})
