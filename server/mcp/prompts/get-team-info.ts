export default defineMcpPrompt({
  name: 'get-team-info',
  description: 'Get detailed information about an NHL team',
  handler: async () => {
    return {
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: 'Tell me about the Montreal Canadiens team stats and standings'
        }
      }]
    }
  }
})
