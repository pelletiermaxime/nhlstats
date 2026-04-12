export default defineMcpPrompt({
  name: 'get-player-details',
  description: 'Get detailed statistics for a specific NHL player',
  handler: async () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: 'Show me detailed stats for Connor McDavid'
        }
      }]
    }
  }
})
