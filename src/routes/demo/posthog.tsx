import { createFileRoute } from '@tanstack/react-router'

import { PostHogDemoPage } from '#/features/playground/posthog/pages/demo-page'

export const Route = createFileRoute('/demo/posthog')({
  component: PostHogDemoPage,
})
