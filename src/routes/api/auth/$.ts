import { createFileRoute } from '@tanstack/react-router'

import { authRouteHandlers } from '#/features/auth/server/handlers'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: authRouteHandlers,
  },
})
