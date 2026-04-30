import { createFileRoute } from '@tanstack/react-router'

import { AddressFormPage } from '#/features/playground/forms/pages/address-form-page'

export const Route = createFileRoute('/demo/form/address')({
  component: AddressFormPage,
})
