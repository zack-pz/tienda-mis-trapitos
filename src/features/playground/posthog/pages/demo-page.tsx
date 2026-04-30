import { usePostHog } from '@posthog/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { env } from '#/env'

export function PostHogDemoPage() {
  const posthog = usePostHog()
  const [eventCount, setEventCount] = useState(0)
  const posthogKey = env.VITE_POSTHOG_KEY
  const isConfigured = Boolean(posthogKey) && posthogKey !== 'phc_xxx'

  const trackEvent = (
    eventName: string,
    properties?: Record<string, unknown>,
  ) => {
    posthog.capture(eventName, properties)
    setEventCount((count) => count + 1)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold">PostHog Demo</h1>

        {!isConfigured && (
          <div className="mb-4 rounded-lg border border-yellow-600 bg-yellow-900/50 p-4">
            <p className="text-sm text-yellow-200">
              <strong>Warning:</strong> VITE_POSTHOG_KEY is not configured. Events
              won't be sent to PostHog. Add it to your{' '}
              <code className="rounded bg-yellow-900 px-1">.env</code> file.
            </p>
          </div>
        )}

        <div className="rounded-lg bg-gray-800 p-6">
          <p className="mb-4 text-gray-400">
            Click the button below to send events to PostHog. Check your PostHog
            dashboard to see them appear in real-time.
          </p>

          <button
            onClick={() => trackEvent('button_clicked', { button: 'demo' })}
            className="w-full rounded bg-cyan-600 px-4 py-3 font-medium hover:bg-cyan-700"
          >
            Track Click
          </button>

          {isConfigured && (
            <div className="mt-6 rounded bg-gray-700 p-4">
              <p className="text-sm text-gray-400">Events sent this session:</p>
              <p className="text-4xl font-bold text-cyan-400">{eventCount}</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-400">
          Open your{' '}
          <a
            href="https://app.posthog.com/events"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline hover:text-cyan-300"
          >
            PostHog Events
          </a>{' '}
          page to see these events appear.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Learn more in the{' '}
          <a
            href="https://posthog.com/docs/libraries/react"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline hover:text-cyan-300"
          >
            PostHog React docs
          </a>
          .
        </p>

        <div className="mt-8">
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
