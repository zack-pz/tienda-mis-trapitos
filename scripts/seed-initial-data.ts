import { eq } from 'drizzle-orm'

import { serverEnv } from '#/env.server'
import { auth } from '#/features/auth/server/auth'
import { db } from '#/shared/db/drizzle'
import {
  colors,
  sizes,
  staffUsers,
  stockLocations,
  user,
} from '#/shared/db/drizzle/schema'

const initialSizes = [
  { code: 'XS', label: 'Extra chica', sortOrder: 10 },
  { code: 'S', label: 'Chica', sortOrder: 20 },
  { code: 'M', label: 'Mediana', sortOrder: 30 },
  { code: 'L', label: 'Grande', sortOrder: 40 },
  { code: 'XL', label: 'Extra grande', sortOrder: 50 },
] as const

const initialColors = [
  { code: 'negro', label: 'Negro', hex: '#111827' },
  { code: 'blanco', label: 'Blanco', hex: '#F9FAFB' },
  { code: 'beige', label: 'Beige', hex: '#D6C6B2' },
  { code: 'rosa', label: 'Rosa', hex: '#EC4899' },
  { code: 'azul-marino', label: 'Azul marino', hex: '#1E3A8A' },
] as const

async function seedSizes() {
  for (const size of initialSizes) {
    await db
      .insert(sizes)
      .values({
        id: crypto.randomUUID(),
        code: size.code,
        label: size.label,
        sortOrder: size.sortOrder,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: sizes.code,
        set: {
          label: size.label,
          sortOrder: size.sortOrder,
          isActive: true,
          updatedAt: new Date(),
        },
      })
  }

  console.log(`✔ Seed tallas (${initialSizes.length})`)
}

async function seedColors() {
  for (const color of initialColors) {
    await db
      .insert(colors)
      .values({
        id: crypto.randomUUID(),
        code: color.code,
        label: color.label,
        hex: color.hex,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: colors.code,
        set: {
          label: color.label,
          hex: color.hex,
          isActive: true,
          updatedAt: new Date(),
        },
      })
  }

  console.log(`✔ Seed colores (${initialColors.length})`)
}

async function seedStockLocation() {
  await db
    .insert(stockLocations)
    .values({
      id: crypto.randomUUID(),
      code: 'deposito-central',
      name: 'Depósito central',
      isDefault: true,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: stockLocations.code,
      set: {
        name: 'Depósito central',
        isDefault: true,
        isActive: true,
        updatedAt: new Date(),
      },
    })

  console.log('✔ Seed depósito principal (deposito-central)')
}

async function seedSuperAdmin() {
  const email = serverEnv.SEED_SUPER_ADMIN_EMAIL?.trim()
  const password = serverEnv.SEED_SUPER_ADMIN_PASSWORD?.trim()
  const name = serverEnv.SEED_SUPER_ADMIN_NAME?.trim() || 'Super Admin'

  if (!email && !password) {
    console.log(
      'ℹ Seed super admin omitido: definí SEED_SUPER_ADMIN_EMAIL y SEED_SUPER_ADMIN_PASSWORD si querés crear el primer staff.',
    )
    return
  }

  if (!email || !password) {
    throw new Error(
      'Para seedear el super admin necesitás SEED_SUPER_ADMIN_EMAIL y SEED_SUPER_ADMIN_PASSWORD juntos.',
    )
  }

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  const authUserId = existingUser?.id
    ? existingUser.id
    : (
        await auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
        })
      ).user.id

  await db
    .insert(staffUsers)
    .values({
      id: crypto.randomUUID(),
      authUserId,
      role: 'super_admin',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: staffUsers.authUserId,
      set: {
        role: 'super_admin',
        isActive: true,
        updatedAt: new Date(),
      },
    })

  console.log(`✔ Seed super admin (${email})`)
}

async function main() {
  await seedSizes()
  await seedColors()
  await seedStockLocation()
  await seedSuperAdmin()

  console.log('✅ Seed inicial completado.')
}

main().catch((error) => {
  console.error('❌ Falló el seed inicial')
  console.error(error)
  process.exit(1)
})
