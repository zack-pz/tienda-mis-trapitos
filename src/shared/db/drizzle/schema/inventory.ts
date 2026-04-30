import { boolean, index, integer, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { staffUsers } from './auth'
import { createdAtColumn, timestamps, updatedAtColumn, uuidColumn, uuidPrimaryKey } from './helpers'
import { productVariants } from './catalog'

export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', [
  'entry',
  'exit',
  'adjustment',
  'return',
])

export const stockLocations = pgTable(
  'stock_locations',
  {
    id: uuidPrimaryKey(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps(),
  },
  (table) => [uniqueIndex('stock_locations_code_idx').on(table.code)],
)

export const inventoryBalances = pgTable(
  'inventory_balances',
  {
    id: uuidPrimaryKey(),
    locationId: uuidColumn('location_id')
      .notNull()
      .references(() => stockLocations.id, { onDelete: 'cascade' }),
    variantId: uuidColumn('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    onHandQty: integer('on_hand_qty').default(0).notNull(),
    reservedQty: integer('reserved_qty').default(0).notNull(),
    availableQty: integer('available_qty').default(0).notNull(),
    updatedAt: updatedAtColumn('updated_at'),
  },
  (table) => [
    uniqueIndex('inventory_balances_location_variant_idx').on(table.locationId, table.variantId),
    index('inventory_balances_variant_id_idx').on(table.variantId),
  ],
)

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: uuidPrimaryKey(),
    locationId: uuidColumn('location_id')
      .notNull()
      .references(() => stockLocations.id),
    variantId: uuidColumn('variant_id')
      .notNull()
      .references(() => productVariants.id),
    movementType: inventoryMovementTypeEnum('movement_type').notNull(),
    quantity: integer('quantity').notNull(),
    reason: text('reason').notNull(),
    referenceType: text('reference_type').notNull(),
    referenceId: text('reference_id'),
    performedBy: uuidColumn('performed_by').references(() => staffUsers.id, {
      onDelete: 'set null',
    }),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index('inventory_movements_location_id_idx').on(table.locationId),
    index('inventory_movements_variant_id_idx').on(table.variantId),
    index('inventory_movements_reference_idx').on(table.referenceType, table.referenceId),
  ],
)
