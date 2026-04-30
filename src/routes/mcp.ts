import { createFileRoute } from '@tanstack/react-router'

import { mcpRouteHandlers } from '#/features/playground/mcp-todos/mcp-server'

export const Route = createFileRoute('/mcp')({
  server: {
    handlers: mcpRouteHandlers,
  },
})
