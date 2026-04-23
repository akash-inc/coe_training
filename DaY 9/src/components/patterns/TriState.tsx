import type { ReactNode } from 'react'

/** Three-phase UI: loading, error, or success `data` — use with a render `children` for exhaustive control. */
export type TriStateValue<T, E = string> =
  | { status: 'loading' }
  | { status: 'error'; error: E }
  | { status: 'ready'; data: T }

type TriStateProps<T, E = string> = {
  value: TriStateValue<T, E>
  children: (state: TriStateValue<T, E>) => ReactNode
}

export function TriState<T, E = string>({ value, children }: TriStateProps<T, E>) {
  return <>{children(value)}</>
}
