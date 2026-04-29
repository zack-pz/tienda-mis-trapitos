import { neon } from '@neondatabase/serverless'

let client: ReturnType<typeof neon> | undefined

export async function getNeonClient() {
  if (!process.env.DATABASE_URL) {
    return undefined
  }

  if (!client) {
    client = await neon(process.env.DATABASE_URL)
  }

  return client
}
