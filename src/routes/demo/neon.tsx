import { createFileRoute } from '@tanstack/react-router'

import { NeonTodosPage, loadNeonTodos } from '#/features/playground/todos-neon/page'

export const Route = createFileRoute('/demo/neon')({
  component: NeonTodosPage,
  loader: loadNeonTodos,
})
