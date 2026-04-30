import { Link, useLoaderData, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { authClient } from '#/features/auth/client/auth-client'

import { createProduct } from '../server/products'

const fieldClassName =
  'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-100'

const textareaClassName =
  'flex min-h-32 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-100'

type VariantDraft = {
  sizeId: string
  colorId: string
  sku: string
  barcode: string
  price: string
  currencyCode: string
}

function createEmptyVariant(): VariantDraft {
  return {
    sizeId: '',
    colorId: '',
    sku: '',
    barcode: '',
    price: '',
    currencyCode: 'MXN',
  }
}

function formatPrice(amountInCents: number | null, currencyCode: string | null) {
  if (amountInCents == null || !currencyCode) {
    return 'Sin precio activo'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currencyCode,
  }).format(amountInCents / 100)
}

export function ProductsAdminPage() {
  const router = useRouter()
  const { access, categories, sizes, colors, products } = useLoaderData({
    from: '/admin/products',
  })
  const { data: session } = authClient.useSession()
  const [variants, setVariants] = useState<VariantDraft[]>([createEmptyVariant()])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  )

  const activeSizes = useMemo(() => sizes.filter((size) => size.isActive), [sizes])
  const activeColors = useMemo(() => colors.filter((color) => color.isActive), [colors])

  const handleVariantChange = (
    index: number,
    field: keyof VariantDraft,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, [field]: value } : variant,
      ),
    )
  }

  const addVariant = () => {
    setVariants((current) => [...current, createEmptyVariant()])
  }

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.length === 1 ? current : current.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      await createProduct({
        data: {
          categoryId: String(formData.get('categoryId') || ''),
          name: String(formData.get('name') || ''),
          slug: String(formData.get('slug') || ''),
          description: String(formData.get('description') || ''),
          brand: String(formData.get('brand') || ''),
          status: String(formData.get('status') || 'draft') as
            | 'draft'
            | 'active'
            | 'archived',
          isFeatured: formData.get('isFeatured') === 'on',
          imageUrl: String(formData.get('imageUrl') || ''),
          variants: variants.map((variant) => ({
            sizeId: variant.sizeId,
            colorId: variant.colorId,
            sku: variant.sku,
            barcode: variant.barcode,
            price: Number.parseFloat(variant.price),
            currencyCode: variant.currencyCode,
          })),
        },
      })

      setSuccessMessage('Producto creado con sus variantes y precio base.')
      setVariants([createEmptyVariant()])
      event.currentTarget.reset()
      await router.invalidate()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo crear el producto.',
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
              Productos y variantes
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--sea-ink-soft)] sm:text-base">
              Acá ya dejamos de hablar del producto como una idea abstracta: lo que vende,
              tiene stock y precio es la variante. Si no entendés eso, después rompés
              catálogo, inventario y checkout de un saque.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/categories"
              className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
            >
              Volver a categorías
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
            Primero autenticación, después administración. Sin identidad real, el backoffice
            es humo.
          </p>
        </section>
      ) : !access.isStaff ? (
        <section className="island-shell mt-8 rounded-2xl border border-rose-200 bg-rose-50/90 p-6 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100">
          <h2 className="text-lg font-semibold">Sin permisos administrativos</h2>
          <p className="mt-2 text-sm">
            Tu usuario no tiene un rol staff activo. Los productos se administran desde base,
            no desde la imaginación del frontend.
          </p>
        </section>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
          <section className="island-shell rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sea-ink-soft)]">
                Alta inicial
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
                Nuevo producto
              </h2>
              <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
                Sesión activa: {access.email} · rol {access.role}
              </p>
            </div>

            {activeCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--sea-ink-soft)]">
                Primero creá al menos una categoría activa.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="categoryId" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                    Categoría
                  </label>
                  <select id="categoryId" name="categoryId" required className={fieldClassName} defaultValue="">
                    <option value="" disabled>
                      Seleccioná una categoría
                    </option>
                    {activeCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                    Nombre del producto
                  </label>
                  <input id="name" name="name" required className={fieldClassName} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="slug" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                      Slug opcional
                    </label>
                    <input id="slug" name="slug" className={fieldClassName} />
                  </div>

                  <div>
                    <label htmlFor="brand" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                      Marca
                    </label>
                    <input id="brand" name="brand" className={fieldClassName} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="status" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                      Estado
                    </label>
                    <select id="status" name="status" defaultValue="draft" className={fieldClassName}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                      URL imagen principal
                    </label>
                    <input id="imageUrl" name="imageUrl" type="url" className={fieldClassName} />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                    Descripción
                  </label>
                  <textarea id="description" name="description" required className={textareaClassName} />
                </div>

                <label className="flex items-center gap-3 text-sm font-medium text-[var(--sea-ink)]">
                  <input type="checkbox" name="isFeatured" className="h-4 w-4" />
                  Marcar como destacado
                </label>

                <div className="rounded-2xl border border-[var(--line)] bg-white/50 p-4 dark:bg-neutral-950/20">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--sea-ink)]">Variantes</h3>
                      <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                        Cada fila es una combinación vendible de talla + color + SKU + precio.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addVariant}
                      className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
                    >
                      Agregar variante
                    </button>
                  </div>

                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div
                        key={`${index}-${variant.sku}`}
                        className="rounded-2xl border border-[var(--line)] bg-white/70 p-4 dark:bg-neutral-900/40"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold text-[var(--sea-ink)]">
                            Variante {index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            disabled={variants.length === 1}
                            className="text-sm font-medium text-rose-600 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-300"
                          >
                            Quitar
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                              Talla
                            </label>
                            <select
                              value={variant.sizeId}
                              onChange={(event) => {
                                handleVariantChange(index, 'sizeId', event.target.value)
                              }}
                              className={fieldClassName}
                              required
                            >
                              <option value="">Seleccioná una talla</option>
                              {activeSizes.map((size) => (
                                <option key={size.id} value={size.id}>
                                  {size.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                              Color
                            </label>
                            <select
                              value={variant.colorId}
                              onChange={(event) => {
                                handleVariantChange(index, 'colorId', event.target.value)
                              }}
                              className={fieldClassName}
                              required
                            >
                              <option value="">Seleccioná un color</option>
                              {activeColors.map((color) => (
                                <option key={color.id} value={color.id}>
                                  {color.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                              SKU
                            </label>
                            <input
                              value={variant.sku}
                              onChange={(event) => {
                                handleVariantChange(index, 'sku', event.target.value)
                              }}
                              className={fieldClassName}
                              required
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                              Barcode
                            </label>
                            <input
                              value={variant.barcode}
                              onChange={(event) => {
                                handleVariantChange(index, 'barcode', event.target.value)
                              }}
                              className={fieldClassName}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                              Precio
                            </label>
                            <input
                              value={variant.price}
                              onChange={(event) => {
                                handleVariantChange(index, 'price', event.target.value)
                              }}
                              type="number"
                              min="0.01"
                              step="0.01"
                              className={fieldClassName}
                              required
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-[var(--sea-ink)]">
                              Moneda
                            </label>
                            <input
                              value={variant.currencyCode}
                              onChange={(event) => {
                                handleVariantChange(index, 'currencyCode', event.target.value.toUpperCase())
                              }}
                              maxLength={3}
                              className={fieldClassName}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                  {isSubmitting ? 'Guardando...' : 'Crear producto con variantes'}
                </button>
              </form>
            )}
          </section>

          <section className="island-shell rounded-2xl p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sea-ink-soft)]">
                  Estado actual
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
                  Productos cargados
                </h2>
              </div>
              <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--sea-ink)]">
                {products.length} total
              </span>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-8 text-center text-sm text-[var(--sea-ink-soft)]">
                Todavía no hay productos. Creá el primero y vas a empezar a ver el modelo
                variant-first trabajar de verdad.
              </div>
            ) : (
              <div className="space-y-5">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-[var(--line)] bg-white/60 p-5 dark:bg-neutral-950/20"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold text-[var(--sea-ink)]">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                            /{product.slug} · {product.categoryName}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--sea-ink)]">
                            {product.status}
                          </span>
                          {product.brand ? (
                            <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--sea-ink)]">
                              {product.brand}
                            </span>
                          ) : null}
                          {product.isFeatured ? (
                            <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[var(--sea-ink)]">
                              destacado
                            </span>
                          ) : null}
                        </div>

                        <p className="max-w-2xl text-sm text-[var(--sea-ink-soft)]">
                          {product.description}
                        </p>
                      </div>

                      {product.primaryImageUrl ? (
                        <img
                          src={product.primaryImageUrl}
                          alt={product.name}
                          className="h-28 w-28 rounded-2xl object-cover shadow-sm"
                        />
                      ) : null}
                    </div>

                    <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/70 dark:bg-neutral-900/30">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--line)] text-left text-[var(--sea-ink-soft)]">
                            <th className="px-4 py-3 font-medium">SKU</th>
                            <th className="px-4 py-3 font-medium">Talla</th>
                            <th className="px-4 py-3 font-medium">Color</th>
                            <th className="px-4 py-3 font-medium">Precio</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variants.map((variant) => (
                            <tr key={variant.id} className="border-b border-[var(--line)] last:border-b-0">
                              <td className="px-4 py-3 font-medium text-[var(--sea-ink)]">
                                {variant.sku}
                              </td>
                              <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                                {variant.sizeLabel}
                              </td>
                              <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="h-3 w-3 rounded-full border border-black/10"
                                    style={{
                                      backgroundColor: variant.colorHex || '#d4d4d8',
                                    }}
                                  />
                                  {variant.colorLabel}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[var(--sea-ink)]">
                                {formatPrice(variant.amountInCents, variant.currencyCode)}
                              </td>
                              <td className="px-4 py-3 text-[var(--sea-ink-soft)]">
                                {variant.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
