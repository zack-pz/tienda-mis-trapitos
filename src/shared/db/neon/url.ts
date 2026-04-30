const neonHostPatterns = [/\.neon\.tech$/i, /\.neon\.build$/i]

function isNeonHostname(hostname: string) {
  return neonHostPatterns.some((pattern) => pattern.test(hostname))
}

export function getNeonDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  const databaseUrl = env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is required and must point to a Neon Postgres database.',
    )
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(databaseUrl)
  } catch {
    throw new Error(
      'DATABASE_URL is invalid. Expected a valid Neon Postgres connection string.',
    )
  }

  if (!isNeonHostname(parsedUrl.hostname)) {
    throw new Error(
      `DATABASE_URL must point to a Neon host. Received hostname: ${parsedUrl.hostname || 'unknown'}`,
    )
  }

  return databaseUrl
}
