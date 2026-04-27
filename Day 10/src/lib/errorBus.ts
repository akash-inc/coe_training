type Listener = (err: Error) => void
const listeners = new Set<Listener>()

export const apiErrorBus = {
  emit(err: Error): void {
    listeners.forEach((l) => l(err))
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
