import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import z from 'zod'

import { handleMcpRequest } from '#/shared/utils/mcp-handler'

import { addTodo } from './todos-store'

const server = new McpServer({
  name: 'start-server',
  version: '1.0.0',
})

server.registerTool(
  'addTodo',
  {
    title: 'Tool to add a todo to a list of todos',
    description: 'Add a todo to a list of todos',
    inputSchema: {
      title: z.string().describe('The title of the todo'),
    },
  },
  ({ title }) => ({
    content: [{ type: 'text', text: String(addTodo(title)) }],
  }),
)

export const mcpRouteHandlers = {
  POST: async ({ request }: { request: Request }) =>
    handleMcpRequest(request, server),
}
