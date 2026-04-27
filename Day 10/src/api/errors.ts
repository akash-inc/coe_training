export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value
  }
  return new Error(typeof value === 'string' ? value : 'Unknown error')
}
