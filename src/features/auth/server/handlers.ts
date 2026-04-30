import { auth } from './auth'

export const authRouteHandlers = {
  GET: ({ request }: { request: Request }) => auth.handler(request),
  POST: ({ request }: { request: Request }) => auth.handler(request),
}
