import { createFileRoute } from '@tanstack/react-router'

import { DemoStorePage } from '#/features/playground/store/pages/demo-store-page'

export const Route = createFileRoute('/demo/store')({
  component: DemoStorePage,
})
