import { Link, useLoaderData, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '#/features/auth/client/auth-client'

import { createCategory } from '../server/categories'

const fieldClassName =
  'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-100'

const textareaClassName =
  'flex min-h-28 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-100'

export function CategoriesAdminPage() {
  const router = useRouter()
  const { access, categories, categoryOptions } = useLoaderData({
    from: '/admin/categories',
  })
  const { data: session } = authClient.useSession()
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      await createCategory({
        data: {
          name: String(formData.get('name') || ''),
          slug: String(formData.get('slug') || ''),
          description: String(formData.get('description') || ''),
          parentId: formData.get('parentId') ? String(formData.get('parentId')) : null,
          sortOrder: Number(formData.get('sortOrder') || 0),
          isActive: formData.get('isActive') === 'on',
        },
      })

      setSuccessMessage('Categoría creada correctamente.')
      event.currentTarget.reset()
      await router.invalidate()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo crear la categoría.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-10">
      <section className="island-shell rise-in rounded-[2rem] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="island-kicker mb-3">Admin / Catálogo</p>
            <h1 className="display-title text-4xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
              Categorías
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
              Acá empieza el catálogo real: estructura, slugs y orden comercial. Sin
              categorías sanas, después querés vender y el producto queda colgado de la
              nada. FUNDAMENTOS.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/products"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Ir a productos
            </Link>
            <Link
              to="/demo/better-auth"
              className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
            >
              {session?.user ? 'Gestionar sesión' : 'Iniciar sesión'}
            </Link>
          </div>
        </div>
      </section>

      {!access.isAuthenticated ? (
        <section className="island-shell mt-8 rounded-2xl border border-amber-200 bg-amber-50/90 p-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <h2 className="text-lg font-semibold">Necesitás iniciar sesión</h2>
          <p className="mt-2 text-sm">
            Podés mirar la idea, pero para crear categorías tenés que autenticarte primero.
          </p>
        </section>
      ) : !access.isStaff ? (
        <section className="island-shell mt-8 rounded-2xl border border-rose-200 bg-rose-50/90 p-6 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <h2 className="text-lg font-semibold">Sin permisos administrativos</h2>
          <p className="mt-2 text-sm">
            Tu sesión existe, pero no tiene un rol staff activo en base de datos. El rol del
            front NO alcanza.
          </p>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
          <section className="island-shell rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sea-ink-soft)]">
                Alta rápida
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
                Nueva categoría
              </h2>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                Sesión activa: {access.email} · rol {access.role}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                  Nombre
                </label>
                <input id="name" name="name" required className={fieldClassName} />
              </div>

              <div>
                <label htmlFor="slug" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                  Slug opcional
                </label>
                <input
                  id="slug"
                  name="slug"
                  placeholder="se-autogenera-si-lo-dejas-vacio"
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="parentId" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                  Categoría padre
                </label>
                <select id="parentId" name="parentId" className={fieldClassName} defaultValue="">
                  <option value="">Sin padre</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sortOrder" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                  Orden
                </label>
                <input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className={fieldClassName}
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                  Descripción
                </label>
                <textarea id="description" name="description" className={textareaClassName} />
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-[var(--sea-ink)]">
                <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4" />
                Activa desde el alta
              </label>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
                  {error}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                  {successMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isSubmitting ? 'Guardando...' : 'Crear categoría'}
              </button>
            </form>
          </section>

          <section className="island-shell rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sea-ink-soft)]">
                  Estado actual
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
                  Categorías creadas
                </h2>
              </div>
              <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)]">
                {categories.length} total
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--sea-ink-soft)]">
                Todavía no hay categorías cargadas.
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <article
                    key={category.id}
                    className="rounded-2xl border border-[var(--line)] bg-white/60 p-5 dark:bg-neutral-950/20"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--sea-ink)]">
                          {category.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                          /{category.slug}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--sea-ink)]">
                          orden {category.sortOrder}
                        </span>
                        <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--sea-ink)]">
                          {category.isActive ? 'activa' : 'inactiva'}
                        </span>
                        {category.parentId ? (
                          <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--sea-ink)]">
                            hija de otra categoría
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {category.description ? (
                      <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">
                        {category.description}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
