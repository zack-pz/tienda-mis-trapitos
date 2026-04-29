import { createFileRoute } from '@tanstack/react-router'

import { TanStackQueryDemoPage } from '#/features/playground/tanstack-query/pages/demo-page'

export const Route = createFileRoute('/demo/tanstack-query')({
  component: TanStackQueryDemoPage,
})
