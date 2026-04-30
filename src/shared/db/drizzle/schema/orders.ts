import { index, integer, jsonb, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { customerProfiles, staffUsers } from './auth'
import {
  createdAtColumn,
  optionalTimestampColumn,
  timestamps,
  uuidColumn,
  uuidPrimaryKey,
} from './helpers'
import { productVariants } from './catalog'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
])
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
])
export const orderAddressTypeEnum = pgEnum('order_address_type', ['billing', 'shipping'])
export const paymentTransactionStatusEnum = pgEnum('payment_transaction_status', [
  'created',
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
])
export const webhookProcessingStatusEnum = pgEnum('webhook_processing_status', [
  'pending',
  'processed',
  'failed',
  'ignored',
])

export const salesOrders = pgTable(
  'sales_orders',
  {
    id: uuidPrimaryKey(),
    orderNumber: text('order_number').notNull(),
    customerId: uuidColumn('customer_id').references(() => customerProfiles.id, {
      onDelete: 'set null',
    }),
    customerEmail: text('customer_email').notNull(),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone'),
    orderStatus: orderStatusEnum('order_status').default('pending').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
    currencyCode: text('currency_code').notNull(),
    subtotalInCents: integer('subtotal_in_cents').default(0).notNull(),
    discountTotalInCents: integer('discount_total_in_cents').default(0).notNull(),
    totalInCents: integer('total_in_cents').default(0).notNull(),
    placedAt: createdAtColumn('placed_at'),
    paidAt: optionalTimestampColumn('paid_at'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('sales_orders_order_number_idx').on(table.orderNumber),
    index('sales_orders_customer_id_idx').on(table.customerId),
    index('sales_orders_customer_email_idx').on(table.customerEmail),
    index('sales_orders_order_status_idx').on(table.orderStatus),
  ],
)

export const salesOrderItems = pgTable(
  'sales_order_items',
  {
    id: uuidPrimaryKey(),
    orderId: uuidColumn('order_id')
      .notNull()
      .references(() => salesOrders.id, { onDelete: 'cascade' }),
    variantId: uuidColumn('variant_id').references(() => productVariants.id, {
      onDelete: 'set null',
    }),
    skuSnapshot: text('sku_snapshot').notNull(),
    productNameSnapshot: text('product_name_snapshot').notNull(),
    sizeLabelSnapshot: text('size_label_snapshot').notNull(),
    colorLabelSnapshot: text('color_label_snapshot').notNull(),
    quantity: integer('quantity').notNull(),
    unitPriceInCents: integer('unit_price_in_cents').notNull(),
    discountInCents: integer('discount_in_cents').default(0).notNull(),
    lineTotalInCents: integer('line_total_in_cents').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [index('sales_order_items_order_id_idx').on(table.orderId)],
)

export const orderAddresses = pgTable(
  'order_addresses',
  {
    id: uuidPrimaryKey(),
    orderId: uuidColumn('order_id')
      .notNull()
      .references(() => salesOrders.id, { onDelete: 'cascade' }),
    addressType: orderAddressTypeEnum('address_type').notNull(),
    recipientName: text('recipient_name').notNull(),
    line1: text('line_1').notNull(),
    line2: text('line_2'),
    city: text('city').notNull(),
    state: text('state'),
    postalCode: text('postal_code').notNull(),
    countryCode: text('country_code').notNull(),
    phone: text('phone'),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex('order_addresses_order_id_address_type_idx').on(
      table.orderId,
      table.addressType,
    ),
  ],
)

export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: uuidPrimaryKey(),
    orderId: uuidColumn('order_id')
      .notNull()
      .references(() => salesOrders.id, { onDelete: 'cascade' }),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    changedBy: uuidColumn('changed_by').references(() => staffUsers.id, {
      onDelete: 'set null',
    }),
    reason: text('reason'),
    createdAt: createdAtColumn(),
  },
  (table) => [index('order_status_history_order_id_idx').on(table.orderId)],
)

export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: uuidPrimaryKey(),
    orderId: uuidColumn('order_id')
      .notNull()
      .references(() => salesOrders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerCheckoutSessionId: text('provider_checkout_session_id'),
    providerPaymentIntentId: text('provider_payment_intent_id'),
    status: paymentTransactionStatusEnum('status').default('created').notNull(),
    amountInCents: integer('amount_in_cents').notNull(),
    currencyCode: text('currency_code').notNull(),
    processedAt: optionalTimestampColumn('processed_at'),
    ...timestamps(),
  },
  (table) => [
    index('payment_transactions_order_id_idx').on(table.orderId),
    uniqueIndex('payment_transactions_checkout_session_idx').on(
      table.providerCheckoutSessionId,
    ),
    uniqueIndex('payment_transactions_payment_intent_idx').on(
      table.providerPaymentIntentId,
    ),
  ],
)

export const paymentWebhookEvents = pgTable(
  'payment_webhook_events',
  {
    id: uuidPrimaryKey(),
    provider: text('provider').notNull(),
    providerEventId: text('provider_event_id').notNull(),
    eventType: text('event_type').notNull(),
    orderId: uuidColumn('order_id').references(() => salesOrders.id, { onDelete: 'set null' }),
    payloadJson: jsonb('payload_json').$type<Record<string, unknown>>().notNull(),
    processedAt: optionalTimestampColumn('processed_at'),
    processingStatus: webhookProcessingStatusEnum('processing_status')
      .default('pending')
      .notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('payment_webhook_events_provider_event_id_idx').on(table.providerEventId),
    index('payment_webhook_events_order_id_idx').on(table.orderId),
  ],
)
