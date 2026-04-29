import { createFileRoute } from '@tanstack/react-router'

import {
  SentryDemoErrorComponent,
  SentryDemoPage,
} from '#/features/playground/sentry/pages/demo-page'

export const Route = createFileRoute('/demo/sentry/testing')({
  component: SentryDemoPage,
  errorComponent: ({ error }) => <SentryDemoErrorComponent error={error} />,
})
