export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function ensureSlug(value: string, fallback: string) {
  const slug = slugify(value) || slugify(fallback)

  if (!slug) {
    throw new Error('No se pudo generar un slug válido.')
  }

  return slug
}
