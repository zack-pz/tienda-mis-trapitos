import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '#/features/marketing/home/home-page'

export const Route = createFileRoute('/')({ component: HomePage })
