import { createFileRoute } from '@tanstack/react-router'

import { TableDemoPage } from '#/features/playground/table/pages/demo-page'

export const Route = createFileRoute('/demo/table')({
  component: TableDemoPage,
})
