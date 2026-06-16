import * as Sentry from '@sentry/react'
import { getTraceId } from './requestTracing'

function parseSampleRate(value, fallback = 0) {
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return fallback
  }
  return Math.min(1, Math.max(0, parsed))
}

function buildTracePropagationTargets() {
  const targets = ['localhost', /^\//]

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (apiBaseUrl) {
    try {
      targets.push(new URL(apiBaseUrl).origin)
    } catch {
      targets.push(apiBaseUrl)
    }
  }

  return targets
}

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()
  if (!dsn) {
    return false
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'development',
    release: 'day15-frontend',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: parseSampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0),
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    tracePropagationTargets: buildTracePropagationTargets(),
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        trace_id: getTraceId(),
      }
      return event
    },
  })

  return true
}

export { Sentry }
