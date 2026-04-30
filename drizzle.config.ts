import { defineConfig } from 'drizzle-kit'

import { getNeonDatabaseUrl } from './src/shared/db/neon/url'
import { serverEnv } from './src/env.server'

export default defineConfig({
  out: './drizzle',
  schema: './src/shared/db/drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: getNeonDatabaseUrl(serverEnv.DATABASE_URL),
  },
})
