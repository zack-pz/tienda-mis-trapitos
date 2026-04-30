import { asc, eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/start-server-core'
import { z } from 'zod'

import {
  getViewerAccess,
  requireAnyRole,
  type StaffRole,
} from '#/features/auth/server/authorization'
import { db } from '#/shared/db/drizzle'
import { categories } from '#/shared/db/drizzle/schema'
import { ensureSlug } from '#/shared/lib/slug'

const catalogAdminRoles = ['super_admin', 'admin_comercial'] as const satisfies readonly StaffRole[]

const createCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(140).optional().default(''),
  description: z.string().trim().max(500).optional().default(''),
  parentId: z.string().uuid().nullable().optional().default(null),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean().default(true),
})

export const getCategoriesAdminData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const access = await getViewerAccess(getRequest().headers)

  if (!access.isStaff) {
    return {
      access,
      categories: [],
      categoryOptions: [],
    }
  }

  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      parentId: categories.parentId,
      isActive: categories.isActive,
      sortOrder: categories.sortOrder,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))

  return {
    access,
    categories: categoryRows,
    categoryOptions: categoryRows.map((category) => ({
      id: category.id,
      name: category.name,
    })),
  }
})

export const createCategory = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => createCategoryInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAnyRole(getRequest().headers, catalogAdminRoles)

    if (data.parentId) {
      const [parentCategory] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, data.parentId))
        .limit(1)

      if (!parentCategory) {
        throw new Error('La categoría padre seleccionada no existe.')
      }
    }

    const resolvedSlug = ensureSlug(data.slug, data.name)

    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, resolvedSlug))
      .limit(1)

    if (existingCategory) {
      throw new Error('Ya existe una categoría con ese slug.')
    }

    const categoryId = crypto.randomUUID()

    await db.insert(categories).values({
      id: categoryId,
      name: data.name,
      slug: resolvedSlug,
      description: data.description || null,
      parentId: data.parentId,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    })

    return {
      success: true,
      categoryId,
    }
  })

export async function loadCategoriesAdminPage() {
  return await getCategoriesAdminData()
}
