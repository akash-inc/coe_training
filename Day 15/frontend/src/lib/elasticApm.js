import { init as initApm } from '@elastic/apm-rum'
import { parseSampleRate } from './observability-utils'

function buildDistributedTracingOrigins() {
  const origins = ['http://localhost:5173', 'http://127.0.0.1:5173']

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (apiBaseUrl) {
    try {
      origins.push(new URL(apiBaseUrl).origin)
    } catch {
      origins.push(apiBaseUrl)
    }
  }

  return origins
}

export function initElasticApm() {
  const serverUrl = import.meta.env.VITE_ELASTIC_APM_SERVER_URL?.trim()
  if (!serverUrl) {
    return null
  }

  return initApm({
    serviceName: import.meta.env.VITE_ELASTIC_APM_SERVICE_NAME || 'day15-frontend',
    serverUrl,
    environment:
      import.meta.env.VITE_ELASTIC_APM_ENVIRONMENT || import.meta.env.MODE || 'development',
    distributedTracingOrigins: buildDistributedTracingOrigins(),
    transactionSampleRate: parseSampleRate(
      import.meta.env.VITE_ELASTIC_APM_TRANSACTION_SAMPLE_RATE,
      1.0,
    ),
  })
}
