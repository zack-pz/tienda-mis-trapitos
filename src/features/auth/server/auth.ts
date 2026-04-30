import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { serverEnv } from '#/env.server'
import { db } from '#/shared/db/drizzle'

export const auth = betterAuth({
  ...(serverEnv.BETTER_AUTH_SECRET ? { secret: serverEnv.BETTER_AUTH_SECRET } : {}),
  ...(serverEnv.BETTER_AUTH_URL ? { baseURL: serverEnv.BETTER_AUTH_URL } : {}),
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
