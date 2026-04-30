import { createFileRoute } from '@tanstack/react-router'

import { SimpleFormPage } from '#/features/playground/forms/pages/simple-form-page'

export const Route = createFileRoute('/demo/form/simple')({
  component: SimpleFormPage,
})
