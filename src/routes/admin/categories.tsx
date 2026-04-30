import { createFileRoute } from '@tanstack/react-router'

import {
  CategoriesAdminPage,
} from '#/features/catalog/admin/pages/categories-admin-page'
import { loadCategoriesAdminPage } from '#/features/catalog/admin/server/categories'

export const Route = createFileRoute('/admin/categories')({
  component: CategoriesAdminPage,
  loader: loadCategoriesAdminPage,
})
