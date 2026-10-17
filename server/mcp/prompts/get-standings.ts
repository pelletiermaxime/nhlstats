export default defineMcpPrompt({
  name: 'get-standings',
  description: 'Get the NHL standings for all teams',
  handler: async () => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'What are the NHL standings for all teams?',
          },
        },
      ],
    }
  },
})
