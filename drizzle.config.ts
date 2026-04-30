import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

import { getNeonDatabaseUrl } from './src/shared/db/neon/url'

config({ path: ['.env.local', '.env'] })

export default defineConfig({
  out: './drizzle',
  schema: './src/shared/db/drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: getNeonDatabaseUrl(),
  },
})
