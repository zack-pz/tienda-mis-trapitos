import { index, pgEnum, pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'

import { createdAtColumn, timestamps, uuidColumn, uuidPrimaryKey } from './helpers'

export const staffRoleEnum = pgEnum('staff_role', [
  'super_admin',
  'admin_comercial',
  'operador_inventario',
  'compras',
  'atencion_ventas',
])

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  username: text('username').unique(),
  displayUsername: text('display_username'),
  ...timestamps(),
})

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps(),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps(),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...timestamps(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const customerProfiles = pgTable(
  'customer_profiles',
  {
    id: uuidPrimaryKey(),
    authUserId: text('auth_user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps(),
  },
  (table) => [index('customer_profiles_auth_user_id_idx').on(table.authUserId)],
)

export const staffUsers = pgTable(
  'staff_users',
  {
    id: uuidPrimaryKey(),
    authUserId: text('auth_user_id')
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: staffRoleEnum('role').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps(),
  },
  (table) => [index('staff_users_auth_user_id_idx').on(table.authUserId)],
)

export const customerAddresses = pgTable(
  'customer_addresses',
  {
    id: uuidPrimaryKey(),
    customerId: uuidColumn('customer_id')
      .notNull()
      .references(() => customerProfiles.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    recipientName: text('recipient_name').notNull(),
    line1: text('line_1').notNull(),
    line2: text('line_2'),
    city: text('city').notNull(),
    state: text('state'),
    postalCode: text('postal_code').notNull(),
    countryCode: text('country_code').notNull(),
    phone: text('phone'),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [index('customer_addresses_customer_id_idx').on(table.customerId)],
)
