import { timestamp, uuid } from 'drizzle-orm/pg-core'

export function uuidPrimaryKey(columnName = 'id') {
  return uuid(columnName).defaultRandom().primaryKey()
}

export function uuidColumn(columnName: string) {
  return uuid(columnName)
}

export function createdAtColumn(columnName = 'created_at') {
  return timestamp(columnName, { withTimezone: true }).defaultNow().notNull()
}

export function optionalTimestampColumn(columnName: string) {
  return timestamp(columnName, { withTimezone: true })
}

export function updatedAtColumn(columnName = 'updated_at') {
  return timestamp(columnName, { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull()
}

export function timestamps() {
  return {
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  }
}
