export default defineMcpPrompt({
  name: 'get-player-stats',
  description: 'Get NHL player statistics for a season',
  handler: async () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: 'Show me the top NHL players by points for this season'
        }
      }]
    }
  }
})
