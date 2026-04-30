import { createFileRoute } from '@tanstack/react-router'

import { BetterAuthDemoPage } from '#/features/auth/pages/better-auth-demo-page'

export const Route = createFileRoute('/demo/better-auth')({
  component: BetterAuthDemoPage,
})
