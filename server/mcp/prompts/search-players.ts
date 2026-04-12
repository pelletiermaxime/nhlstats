export default defineMcpPrompt({
  name: 'search-players',
  description: 'Search for NHL players by name',
  handler: async () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: 'Find players named Connor in the NHL'
        }
      }]
    }
  }
})
