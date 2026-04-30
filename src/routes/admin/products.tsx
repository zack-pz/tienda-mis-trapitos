import { createFileRoute } from '@tanstack/react-router'

import { ProductsAdminPage } from '#/features/catalog/admin/pages/products-admin-page'
import { loadProductsAdminPage } from '#/features/catalog/admin/server/products'

export const Route = createFileRoute('/admin/products')({
  component: ProductsAdminPage,
  loader: loadProductsAdminPage,
})
