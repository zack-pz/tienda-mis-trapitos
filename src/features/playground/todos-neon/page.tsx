import * as Sentry from '@sentry/tanstackstart-react'
import { useLoaderData, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc } from 'drizzle-orm'

import { db } from '#/shared/db/drizzle'
import { todos } from '#/shared/db/drizzle/schema'

const getTodos = createServerFn({
  method: 'GET',
}).handler(async () => {
  return await Sentry.startSpan(
    {
      name: 'Load Neon todos',
      op: 'db.query',
    },
    async () =>
      db.query.todos.findMany({
        orderBy: [desc(todos.createdAt)],
      }),
  )
})

const insertTodo = createServerFn({
  method: 'POST',
})
  .inputValidator((data: { title: string }) => data)
  .handler(async ({ data }) => {
    return await Sentry.startSpan(
      {
        name: 'Create Neon todo',
        op: 'db.insert',
      },
      async () => {
        await db.insert(todos).values({ title: data.title })
        return { success: true }
      },
    )
  })

export async function loadNeonTodos() {
  return { items: await getTodos() }
}

export function NeonTodosPage() {
  const { items } = useLoaderData({ from: '/demo/neon' })
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)
    await insertTodo({ data: { title: data.title as string } })
    router.invalidate()
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(circle at 5% 40%, #63F655 0%, #00E0D9 40%, #1a0f0a 100%)',
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border-8 border-black/10 bg-black/50 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 flex items-center justify-center gap-4 rounded-lg bg-black/30 p-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-75 blur transition duration-1000 group-hover:opacity-100" />
            <div className="relative">
              <img
                src="/demo-neon.svg"
                alt="Neon Logo"
                className="h-12 w-12 transition-transform duration-200 hover:scale-110"
              />
            </div>
          </div>
          <h1 className="bg-gradient-to-r from-emerald-200 to-cyan-200 bg-clip-text text-3xl font-bold text-transparent">
            Neon Database Demo
          </h1>
        </div>
        <h1 className="mb-4 text-2xl font-bold">Todos</h1>
        <ul className="mb-6 space-y-3">
          {items.map((todo) => (
            <li
              key={todo.id}
              className="group cursor-pointer rounded-lg border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium group-hover:text-white/90">
                  {todo.title}
                </span>
                <span className="text-xs text-white/50">#{todo.id}</span>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            name="title"
            className="w-full rounded-md border border-gray-300 bg-black/20 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00E0D9]"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-[#00E0D9] px-6 py-2 font-medium text-black transition-colors hover:bg-[#00E0D9]/80 focus:outline-none focus:ring-2 focus:ring-[#00E0D9] focus:ring-offset-2 disabled:opacity-50"
          >
            Add Todo
          </button>
        </form>

        <div className="mt-8 rounded-lg bg-black/30 p-6 text-left">
          <h3 className="mb-3 text-lg font-semibold">Neon-only setup</h3>
          <ul className="space-y-3 text-sm text-white/80">
            <li>
              Set{' '}
              <code className="rounded bg-black/30 px-2 py-1">
                DATABASE_URL
              </code>{' '}
              to a <span className="font-semibold text-emerald-300">Neon</span>{' '}
              connection string.
            </li>
            <li>
              Drizzle and Drizzle Kit now reject non-Neon hosts, so localhost
              configs fail fast.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
