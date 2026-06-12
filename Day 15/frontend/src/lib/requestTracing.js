const TRACE_STORAGE_KEY = 'day15.trace_id'

export function getTraceId() {
  let traceId = sessionStorage.getItem(TRACE_STORAGE_KEY)
  if (!traceId) {
    traceId = crypto.randomUUID()
    sessionStorage.setItem(TRACE_STORAGE_KEY, traceId)
  }
  return traceId
}

export function createRequestId() {
  return crypto.randomUUID()
}

export function tracingHeaders(extraHeaders = {}) {
  return {
    'X-Trace-ID': getTraceId(),
    'X-Request-ID': createRequestId(),
    ...extraHeaders,
  }
}

export function tracingQueryParams(params = {}) {
  return {
    trace_id: getTraceId(),
    request_id: createRequestId(),
    ...params,
  }
}
