import { createRootRouteWithContext, useNavigate } from '@tanstack/react-router'

import RootDocument, { getDocumentHead } from '#/app/shell/root-document'
import type { AppRouterContext } from '#/app/providers/router-context'
import { Button } from '#/shared/ui/button'

function RootNotFound() {
  const navigate = useNavigate()

  return (
    <main className="page-wrap flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-16">
      <section className="island-shell w-full max-w-xl rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">404</p>
        <h1 className="display-title mb-4 text-4xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          Esta ruta no existe.
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-sm text-[var(--sea-ink-soft)] sm:text-base">
          TanStack Router cayó en un not found dentro de la ruta raíz. Te mandamos de
          vuelta al inicio para que no quedes colgado con un fallback genérico.
        </p>
        <div className="flex justify-center">
          <Button onClick={() => navigate({ to: '/' })}>Volver al inicio</Button>
        </div>
      </section>
    </main>
  )
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  head: getDocumentHead,
  shellComponent: RootDocument,
  notFoundComponent: RootNotFound,
})
