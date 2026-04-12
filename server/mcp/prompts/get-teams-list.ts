export default defineMcpPrompt({
  name: 'get-teams-list',
  description: 'Get list of all NHL teams',
  handler: async () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: 'List all NHL teams'
        }
      }]
    }
  }
})
