import { createRootRouteWithContext } from '@tanstack/react-router'

import RootDocument, { getDocumentHead } from '#/app/shell/root-document'
import type { AppRouterContext } from '#/app/providers/router-context'

export const Route = createRootRouteWithContext<AppRouterContext>()({
  head: getDocumentHead,
  shellComponent: RootDocument,
})
