import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import {
  timestamp,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { staffUsers } from './auth'
import { optionalTimestampColumn, timestamps, uuidColumn, uuidPrimaryKey } from './helpers'

export const productStatusEnum = pgEnum('product_status', ['draft', 'active', 'archived'])
export const productVariantStatusEnum = pgEnum('product_variant_status', [
  'active',
  'inactive',
])
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount'])
export const offerStatusEnum = pgEnum('offer_status', ['draft', 'active', 'paused', 'expired'])

export const categories = pgTable(
  'categories',
  {
    id: uuidPrimaryKey(),
    parentId: uuidColumn('parent_id').references((): AnyPgColumn => categories.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('categories_slug_idx').on(table.slug),
    index('categories_parent_id_idx').on(table.parentId),
  ],
)

export const products = pgTable(
  'products',
  {
    id: uuidPrimaryKey(),
    categoryId: uuidColumn('category_id')
      .notNull()
      .references(() => categories.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description').notNull(),
    brand: text('brand'),
    status: productStatusEnum('status').default('draft').notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('products_slug_idx').on(table.slug),
    index('products_category_id_idx').on(table.categoryId),
    index('products_status_idx').on(table.status),
  ],
)

export const productImages = pgTable(
  'product_images',
  {
    id: uuidPrimaryKey(),
    productId: uuidColumn('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url').notNull(),
    altText: text('alt_text'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    ...timestamps(),
  },
  (table) => [index('product_images_product_id_idx').on(table.productId)],
)

export const sizes = pgTable(
  'sizes',
  {
    id: uuidPrimaryKey(),
    code: text('code').notNull(),
    label: text('label').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps(),
  },
  (table) => [uniqueIndex('sizes_code_idx').on(table.code)],
)

export const colors = pgTable(
  'colors',
  {
    id: uuidPrimaryKey(),
    code: text('code').notNull(),
    label: text('label').notNull(),
    hex: text('hex'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps(),
  },
  (table) => [uniqueIndex('colors_code_idx').on(table.code)],
)

export const productVariants = pgTable(
  'product_variants',
  {
    id: uuidPrimaryKey(),
    productId: uuidColumn('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sizeId: uuidColumn('size_id')
      .notNull()
      .references(() => sizes.id),
    colorId: uuidColumn('color_id')
      .notNull()
      .references(() => colors.id),
    sku: text('sku').notNull(),
    barcode: text('barcode'),
    status: productVariantStatusEnum('status').default('active').notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('product_variants_sku_idx').on(table.sku),
    uniqueIndex('product_variants_product_size_color_idx').on(
      table.productId,
      table.sizeId,
      table.colorId,
    ),
    index('product_variants_product_id_idx').on(table.productId),
  ],
)

export const variantPrices = pgTable(
  'variant_prices',
  {
    id: uuidPrimaryKey(),
    variantId: uuidColumn('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    amountInCents: integer('amount_in_cents').notNull(),
    currencyCode: text('currency_code').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).defaultNow().notNull(),
    endsAt: optionalTimestampColumn('ends_at'),
    isActive: boolean('is_active').default(true).notNull(),
    createdBy: uuidColumn('created_by').references(() => staffUsers.id, {
      onDelete: 'set null',
    }),
    ...timestamps(),
  },
  (table) => [
    index('variant_prices_variant_id_idx').on(table.variantId),
    index('variant_prices_is_active_idx').on(table.isActive),
  ],
)

export const offers = pgTable(
  'offers',
  {
    id: uuidPrimaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    discountType: discountTypeEnum('discount_type').notNull(),
    discountValue: integer('discount_value').notNull(),
    priority: integer('priority').default(0).notNull(),
    status: offerStatusEnum('status').default('draft').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).defaultNow().notNull(),
    endsAt: optionalTimestampColumn('ends_at'),
    ...timestamps(),
  },
  (table) => [index('offers_status_idx').on(table.status)],
)

export const offerProducts = pgTable(
  'offer_products',
  {
    offerId: uuidColumn('offer_id')
      .notNull()
      .references(() => offers.id, { onDelete: 'cascade' }),
    productId: uuidColumn('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.offerId, table.productId], name: 'offer_products_pk' }),
    index('offer_products_product_id_idx').on(table.productId),
  ],
)

export const offerVariants = pgTable(
  'offer_variants',
  {
    offerId: uuidColumn('offer_id')
      .notNull()
      .references(() => offers.id, { onDelete: 'cascade' }),
    variantId: uuidColumn('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.offerId, table.variantId], name: 'offer_variants_pk' }),
    index('offer_variants_variant_id_idx').on(table.variantId),
  ],
)
