import { Component, type ErrorInfo, type ReactNode } from 'react'

type QueryErrorBoundaryProps = {
  children: ReactNode
  onReset: () => void
  fallback: (args: { error: Error; reset: () => void }) => ReactNode
}

type S = { error: Error | null }

export class QueryErrorBoundary extends Component<QueryErrorBoundaryProps, S> {
  state: S = { error: null }

  static getDerivedStateFromError(error: Error): S {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('QueryErrorBoundary', error, info.componentStack)
    }
  }

  private reset = () => {
    this.props.onReset()
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (error) {
      return this.props.fallback({ error, reset: this.reset })
    }
    return this.props.children
  }
}
