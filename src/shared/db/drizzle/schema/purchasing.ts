import { boolean, index, integer, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'

import { staffUsers } from './auth'
import {
  createdAtColumn,
  optionalTimestampColumn,
  timestamps,
  uuidColumn,
  uuidPrimaryKey,
} from './helpers'
import { productVariants } from './catalog'

export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', [
  'draft',
  'issued',
  'partially_received',
  'received',
  'cancelled',
])

export const suppliers = pgTable(
  'suppliers',
  {
    id: uuidPrimaryKey(),
    name: text('name').notNull(),
    contactName: text('contact_name'),
    email: text('email'),
    phone: text('phone'),
    taxId: text('tax_id'),
    notes: text('notes'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps(),
  },
  (table) => [index('suppliers_name_idx').on(table.name)],
)

export const purchaseOrders = pgTable(
  'purchase_orders',
  {
    id: uuidPrimaryKey(),
    supplierId: uuidColumn('supplier_id')
      .notNull()
      .references(() => suppliers.id),
    poNumber: text('po_number').notNull().unique(),
    status: purchaseOrderStatusEnum('status').default('draft').notNull(),
    orderedAt: optionalTimestampColumn('ordered_at'),
    expectedAt: optionalTimestampColumn('expected_at'),
    notes: text('notes'),
    createdBy: uuidColumn('created_by')
      .notNull()
      .references(() => staffUsers.id),
    ...timestamps(),
  },
  (table) => [
    index('purchase_orders_supplier_id_idx').on(table.supplierId),
    index('purchase_orders_status_idx').on(table.status),
  ],
)

export const purchaseOrderItems = pgTable(
  'purchase_order_items',
  {
    id: uuidPrimaryKey(),
    purchaseOrderId: uuidColumn('purchase_order_id')
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
    variantId: uuidColumn('variant_id')
      .notNull()
      .references(() => productVariants.id),
    orderedQty: integer('ordered_qty').notNull(),
    receivedQty: integer('received_qty').default(0).notNull(),
    costInCents: integer('cost_in_cents'),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index('purchase_order_items_purchase_order_id_idx').on(table.purchaseOrderId),
    index('purchase_order_items_variant_id_idx').on(table.variantId),
  ],
)

export const purchaseReceipts = pgTable(
  'purchase_receipts',
  {
    id: uuidPrimaryKey(),
    purchaseOrderId: uuidColumn('purchase_order_id')
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: 'cascade' }),
    receivedBy: uuidColumn('received_by')
      .notNull()
      .references(() => staffUsers.id),
    receivedAt: createdAtColumn('received_at'),
    notes: text('notes'),
    createdAt: createdAtColumn(),
  },
  (table) => [index('purchase_receipts_purchase_order_id_idx').on(table.purchaseOrderId)],
)

export const purchaseReceiptItems = pgTable(
  'purchase_receipt_items',
  {
    id: uuidPrimaryKey(),
    receiptId: uuidColumn('receipt_id')
      .notNull()
      .references(() => purchaseReceipts.id, { onDelete: 'cascade' }),
    purchaseOrderItemId: uuidColumn('purchase_order_item_id')
      .notNull()
      .references(() => purchaseOrderItems.id, { onDelete: 'cascade' }),
    variantId: uuidColumn('variant_id')
      .notNull()
      .references(() => productVariants.id),
    receivedQty: integer('received_qty').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [index('purchase_receipt_items_receipt_id_idx').on(table.receiptId)],
)
