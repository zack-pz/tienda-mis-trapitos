import { addTodo, getTodos, subscribeToTodos } from './todos-store'

export const demoMcpTodosHandlers = {
  GET: () => {
    let unsubscribe = () => {}
    let pingInterval: ReturnType<typeof setInterval> | undefined

    const stream = new ReadableStream({
      start(controller) {
        pingInterval = setInterval(() => {
          try {
            controller.enqueue('event: ping\n\n')
          } catch {
            clearInterval(pingInterval)
          }
        }, 1000)

        unsubscribe = subscribeToTodos((todos) => {
          controller.enqueue(`data: ${JSON.stringify(todos)}\n\n`)
        })

        controller.enqueue(`data: ${JSON.stringify(getTodos())}\n\n`)
      },
      cancel() {
        unsubscribe()

        if (pingInterval) {
          clearInterval(pingInterval)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  },
  POST: async ({ request }: { request: Request }) => {
    const { title } = await request.json()
    addTodo(title)
    return Response.json(getTodos())
  },
}
