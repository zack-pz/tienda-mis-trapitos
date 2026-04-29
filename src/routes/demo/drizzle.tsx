import { createFileRoute } from '@tanstack/react-router'

import {
  DrizzleTodosPage,
  loadDrizzleTodos,
} from '#/features/playground/todos-drizzle/page'

export const Route = createFileRoute('/demo/drizzle')({
  component: DrizzleTodosPage,
  loader: loadDrizzleTodos,
})
