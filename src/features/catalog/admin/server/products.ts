import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/start-server-core'
import { z } from 'zod'

import {
  getViewerAccess,
  requireAnyRole,
  type StaffRole,
} from '#/features/auth/server/authorization'
import { db } from '#/shared/db/drizzle'
import {
  categories,
  colors,
  productImages,
  products,
  productStatusEnum,
  productVariants,
  sizes,
  variantPrices,
} from '#/shared/db/drizzle/schema'
import { ensureSlug } from '#/shared/lib/slug'

const catalogAdminRoles = ['super_admin', 'admin_comercial'] as const satisfies readonly StaffRole[]

const createVariantInputSchema = z.object({
  sizeId: z.string().uuid(),
  colorId: z.string().uuid(),
  sku: z.string().trim().min(2).max(120),
  barcode: z.string().trim().max(120).optional().default(''),
  price: z.number().positive().max(999999.99),
  currencyCode: z.string().trim().length(3),
})

const createProductInputSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().max(180).optional().default(''),
  description: z.string().trim().min(10).max(4000),
  brand: z.string().trim().max(120).optional().default(''),
  status: z.enum(productStatusEnum.enumValues).default('draft'),
  isFeatured: z.boolean().default(false),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).optional().default(''),
  variants: z.array(createVariantInputSchema).min(1).max(30),
})

function toAmountInCents(price: number) {
  return Math.round(price * 100)
}

function normalizeSku(sku: string) {
  return sku.trim().toUpperCase()
}

function normalizeCurrencyCode(currencyCode: string) {
  return currencyCode.trim().toUpperCase()
}

function createVariantCombinationKey(sizeId: string, colorId: string) {
  return `${sizeId}:${colorId}`
}

export const getProductsAdminData = createServerFn({
  method: 'GET',
}).handler(async () => {
  const access = await getViewerAccess(getRequest().headers)

  if (!access.isStaff) {
    return {
      access,
      categories: [],
      sizes: [],
      colors: [],
      products: [],
    }
  }

  const [categoryRows, sizeRows, colorRows, productRows, imageRows, variantRows] =
    await Promise.all([
      db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          isActive: categories.isActive,
        })
        .from(categories)
        .orderBy(asc(categories.sortOrder), asc(categories.name)),
      db
        .select({
          id: sizes.id,
          code: sizes.code,
          label: sizes.label,
          isActive: sizes.isActive,
          sortOrder: sizes.sortOrder,
        })
        .from(sizes)
        .orderBy(asc(sizes.sortOrder), asc(sizes.label)),
      db
        .select({
          id: colors.id,
          code: colors.code,
          label: colors.label,
          hex: colors.hex,
          isActive: colors.isActive,
        })
        .from(colors)
        .orderBy(asc(colors.label)),
      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          brand: products.brand,
          status: products.status,
          isFeatured: products.isFeatured,
          categoryId: products.categoryId,
          categoryName: categories.name,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .orderBy(desc(products.createdAt), asc(products.name)),
      db
        .select({
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
        })
        .from(productImages)
        .where(eq(productImages.isPrimary, true))
        .orderBy(asc(productImages.sortOrder), desc(productImages.createdAt)),
      db
        .select({
          variantId: productVariants.id,
          productId: productVariants.productId,
          sku: productVariants.sku,
          barcode: productVariants.barcode,
          status: productVariants.status,
          sizeLabel: sizes.label,
          sizeCode: sizes.code,
          colorLabel: colors.label,
          colorCode: colors.code,
          colorHex: colors.hex,
          amountInCents: variantPrices.amountInCents,
          currencyCode: variantPrices.currencyCode,
        })
        .from(productVariants)
        .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
        .innerJoin(colors, eq(productVariants.colorId, colors.id))
        .leftJoin(
          variantPrices,
          and(
            eq(variantPrices.variantId, productVariants.id),
            eq(variantPrices.isActive, true),
            isNull(variantPrices.endsAt),
          ),
        )
        .orderBy(asc(productVariants.productId), asc(sizes.sortOrder), asc(colors.label)),
    ])

  const productImagesByProductId = new Map<string, string>()

  for (const image of imageRows) {
    if (!productImagesByProductId.has(image.productId)) {
      productImagesByProductId.set(image.productId, image.imageUrl)
    }
  }

  const variantsByProductId = new Map<
    string,
    Array<{
      id: string
      sku: string
      barcode: string | null
      status: 'active' | 'inactive'
      sizeLabel: string
      sizeCode: string
      colorLabel: string
      colorCode: string
      colorHex: string | null
      amountInCents: number | null
      currencyCode: string | null
    }>
  >()

  for (const variant of variantRows) {
    const variants = variantsByProductId.get(variant.productId) ?? []

    variants.push({
      id: variant.variantId,
      sku: variant.sku,
      barcode: variant.barcode,
      status: variant.status,
      sizeLabel: variant.sizeLabel,
      sizeCode: variant.sizeCode,
      colorLabel: variant.colorLabel,
      colorCode: variant.colorCode,
      colorHex: variant.colorHex,
      amountInCents: variant.amountInCents,
      currencyCode: variant.currencyCode,
    })

    variantsByProductId.set(variant.productId, variants)
  }

  return {
    access,
    categories: categoryRows,
    sizes: sizeRows,
    colors: colorRows,
    products: productRows.map((product) => ({
      ...product,
      primaryImageUrl: productImagesByProductId.get(product.id) ?? null,
      variants: variantsByProductId.get(product.id) ?? [],
    })),
  }
})

export const createProduct = createServerFn({
  method: 'POST',
})
  .inputValidator((data: unknown) => createProductInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { staffUser } = await requireAnyRole(getRequest().headers, catalogAdminRoles)

    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1)

    if (!existingCategory) {
      throw new Error('La categoría seleccionada no existe.')
    }

    const resolvedSlug = ensureSlug(data.slug, data.name)

    const [existingProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, resolvedSlug))
      .limit(1)

    if (existingProduct) {
      throw new Error('Ya existe un producto con ese slug.')
    }

    const payloadCombinationKeys = new Set<string>()
    const payloadSkus = new Set<string>()

    for (const variant of data.variants) {
      const combinationKey = createVariantCombinationKey(variant.sizeId, variant.colorId)
      const normalizedSku = normalizeSku(variant.sku)

      if (payloadCombinationKeys.has(combinationKey)) {
        throw new Error('No podés repetir la misma combinación talla + color en un producto.')
      }

      if (payloadSkus.has(normalizedSku)) {
        throw new Error('No podés repetir SKUs dentro del mismo producto.')
      }

      payloadCombinationKeys.add(combinationKey)
      payloadSkus.add(normalizedSku)
    }

    const sizeIds = Array.from(new Set(data.variants.map((variant) => variant.sizeId)))
    const colorIds = Array.from(new Set(data.variants.map((variant) => variant.colorId)))
    const skus = Array.from(payloadSkus)

    const [existingSizes, existingColors, existingSkus] = await Promise.all([
      db.select({ id: sizes.id }).from(sizes).where(inArray(sizes.id, sizeIds)),
      db.select({ id: colors.id }).from(colors).where(inArray(colors.id, colorIds)),
      db
        .select({ sku: productVariants.sku })
        .from(productVariants)
        .where(inArray(productVariants.sku, skus)),
    ])

    if (existingSizes.length !== sizeIds.length) {
      throw new Error('Una o más tallas seleccionadas no existen en la base de datos.')
    }

    if (existingColors.length !== colorIds.length) {
      throw new Error('Uno o más colores seleccionados no existen en la base de datos.')
    }

    if (existingSkus.length > 0) {
      throw new Error(`Ya existe al menos un SKU cargado: ${existingSkus[0]?.sku}.`)
    }

    const productId = crypto.randomUUID()
    const variantRows = data.variants.map((variant) => ({
      id: crypto.randomUUID(),
      productId,
      sizeId: variant.sizeId,
      colorId: variant.colorId,
      sku: normalizeSku(variant.sku),
      barcode: variant.barcode || null,
      status: 'active' as const,
    }))
    const priceRows = data.variants.map((variant, index) => ({
      id: crypto.randomUUID(),
      variantId: variantRows[index]!.id,
      amountInCents: toAmountInCents(variant.price),
      currencyCode: normalizeCurrencyCode(variant.currencyCode),
      createdBy: staffUser.id,
      isActive: true,
    }))

    const insertProductStatement = db.insert(products).values({
      id: productId,
      categoryId: data.categoryId,
      name: data.name,
      slug: resolvedSlug,
      description: data.description,
      brand: data.brand || null,
      status: data.status,
      isFeatured: data.isFeatured,
    })
    const insertVariantsStatement = db.insert(productVariants).values(variantRows)
    const insertPricesStatement = db.insert(variantPrices).values(priceRows)

    if (data.imageUrl) {
      const insertImageStatement = db.insert(productImages).values({
        id: crypto.randomUUID(),
        productId,
        imageUrl: data.imageUrl,
        altText: data.name,
        sortOrder: 0,
        isPrimary: true,
      })

      await db.batch([
        insertProductStatement,
        insertImageStatement,
        insertVariantsStatement,
        insertPricesStatement,
      ])
    } else {
      await db.batch([
        insertProductStatement,
        insertVariantsStatement,
        insertPricesStatement,
      ])
    }

    return {
      success: true,
      productId,
      createdVariants: variantRows.length,
    }
  })

export async function loadProductsAdminPage() {
  return await getProductsAdminData()
}
