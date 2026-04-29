import fs from 'node:fs'

export type Todo = {
  id: number
  title: string
}

const todosPath = './mcp-todos.json'

const todos = fs.existsSync(todosPath)
  ? (JSON.parse(fs.readFileSync(todosPath, 'utf8')) as Todo[])
  : [{ id: 1, title: 'Buy groceries' }]

let subscribers: Array<(todos: Todo[]) => void> = []

export function getTodos() {
  return todos
}

export function addTodo(title: string) {
  todos.push({ id: todos.length + 1, title })
  fs.writeFileSync(todosPath, JSON.stringify(todos, null, 2))
  notifySubscribers()
}

export function subscribeToTodos(callback: (todos: Todo[]) => void) {
  subscribers.push(callback)
  callback(todos)

  return () => {
    subscribers = subscribers.filter((subscriber) => subscriber !== callback)
  }
}

function notifySubscribers() {
  for (const callback of subscribers) {
    try {
      callback(todos)
    } catch {
      // noop
    }
  }
}
