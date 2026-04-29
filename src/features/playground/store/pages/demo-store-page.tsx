import { useStore } from '@tanstack/react-store'

import { fullName, store } from '../model/demo-store'

function FirstName() {
  const firstName = useStore(store, (state) => state.firstName)

  return (
    <input
      type="text"
      value={firstName}
      onChange={(event) =>
        store.setState((state) => ({ ...state, firstName: event.target.value }))
      }
      className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 outline-none transition-colors duration-200 placeholder-white/40 hover:border-white/40 focus:border-white/60"
    />
  )
}

function LastName() {
  const lastName = useStore(store, (state) => state.lastName)

  return (
    <input
      type="text"
      value={lastName}
      onChange={(event) =>
        store.setState((state) => ({ ...state, lastName: event.target.value }))
      }
      className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 outline-none transition-colors duration-200 placeholder-white/40 hover:border-white/40 focus:border-white/60"
    />
  )
}

function FullName() {
  const name = useStore(fullName, (state) => state)

  return <div className="rounded-lg bg-white/10 px-4 py-2 outline-none">{name}</div>
}

export function DemoStorePage() {
  return (
    <div
      className="flex min-h-[calc(100vh-32px)] h-full w-full items-center justify-center p-8 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 80% 80%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)',
      }}
    >
      <div className="flex min-w-1/2 flex-col gap-4 rounded-xl bg-white/10 p-8 text-3xl shadow-lg backdrop-blur-lg">
        <h1 className="mb-5 text-4xl font-bold">Store Example</h1>
        <FirstName />
        <LastName />
        <FullName />
      </div>
    </div>
  )
}
