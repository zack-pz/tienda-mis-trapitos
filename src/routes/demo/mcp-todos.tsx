import { createFileRoute } from '@tanstack/react-router'

import { McpTodosPage } from '#/features/playground/mcp-todos/page'

export const Route = createFileRoute('/demo/mcp-todos')({
  component: McpTodosPage,
})
