import { createFileRoute } from '@tanstack/react-router'

import { AboutPage } from '#/features/marketing/about/about-page'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})
