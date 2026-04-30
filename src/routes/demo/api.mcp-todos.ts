import { createFileRoute } from '@tanstack/react-router'

import { demoMcpTodosHandlers } from '#/features/playground/mcp-todos/api-handlers'

export const Route = createFileRoute('/demo/api/mcp-todos')({
  server: {
    handlers: demoMcpTodosHandlers,
  },
})
