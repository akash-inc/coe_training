type Kind = 'query' | 'mutation'

type Sink = (error: Error, meta: { kind: Kind; label?: string }) => void

let sink: Sink | null = null

export function setApiErrorSink(next: Sink | null) {
  sink = next
}

export function reportApiError(
  err: Error,
  meta: { kind: Kind; label?: string } = { kind: 'query' },
) {
  if (import.meta.env.DEV) {
    console.error(err)
  }
  sink?.(err, meta)
}
