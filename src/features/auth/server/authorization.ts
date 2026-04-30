import { eq } from 'drizzle-orm'

import { db } from '#/shared/db/drizzle'
import { staffRoleEnum, staffUsers } from '#/shared/db/drizzle/schema/auth'

import { auth } from './auth'

export type StaffRole = (typeof staffRoleEnum.enumValues)[number]
export type StaffUserRecord = typeof staffUsers.$inferSelect
export type AuthSession = typeof auth.$Infer.Session

export interface ViewerAccess {
  isAuthenticated: boolean
  isStaff: boolean
  userId: string | null
  email: string | null
  name: string | null
  role: StaffRole | null
  staffUserId: string | null
}

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export async function getSessionFromHeaders(headers: Headers) {
  return (await auth.api.getSession({ headers })) ?? null
}

async function getStaffUserByAuthUserId(authUserId: string) {
  const [staffUser] = await db
    .select()
    .from(staffUsers)
    .where(eq(staffUsers.authUserId, authUserId))
    .limit(1)

  return staffUser ?? null
}

export async function getViewerAccess(headers: Headers): Promise<ViewerAccess> {
  const session = await getSessionFromHeaders(headers)

  if (!session?.user) {
    return {
      isAuthenticated: false,
      isStaff: false,
      userId: null,
      email: null,
      name: null,
      role: null,
      staffUserId: null,
    }
  }

  const staffUser = await getStaffUserByAuthUserId(session.user.id)

  return {
    isAuthenticated: true,
    isStaff: !!staffUser?.isActive,
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: staffUser?.isActive ? staffUser.role : null,
    staffUserId: staffUser?.isActive ? staffUser.id : null,
  }
}

export async function requireAuthenticatedUser(headers: Headers): Promise<AuthSession> {
  const session = await getSessionFromHeaders(headers)

  if (!session?.user) {
    throw new AuthorizationError('Necesitás iniciar sesión para continuar.', 401)
  }

  return session
}

export async function requireStaffUser(headers: Headers) {
  const session = await requireAuthenticatedUser(headers)
  const staffUser = await getStaffUserByAuthUserId(session.user.id)

  if (!staffUser || !staffUser.isActive) {
    throw new AuthorizationError(
      'Tu usuario no tiene permisos administrativos activos.',
      403,
    )
  }

  return { session, staffUser }
}

export async function requireRole(headers: Headers, role: StaffRole) {
  const result = await requireStaffUser(headers)

  if (result.staffUser.role !== role) {
    throw new AuthorizationError(
      `Se requiere el rol ${role} para ejecutar esta acción.`,
      403,
    )
  }

  return result
}

export async function requireAnyRole(headers: Headers, roles: readonly StaffRole[]) {
  const result = await requireStaffUser(headers)

  if (!roles.includes(result.staffUser.role)) {
    throw new AuthorizationError(
      `Se requiere uno de estos roles: ${roles.join(', ')}.`,
      403,
    )
  }

  return result
}
