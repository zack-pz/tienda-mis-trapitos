import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import { getNeonDatabaseUrl } from '#/shared/db/neon/url'
import * as schema from './schema'

const sql = neon(getNeonDatabaseUrl())

export const db = drizzle({ client: sql, schema })
