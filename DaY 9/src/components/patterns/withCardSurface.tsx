import type { ComponentType } from 'react'
import { cn } from '../../lib/cn'

/** HOC: merges a shared surface `className` (card-style chrome) with the inner component’s `className`. */
export function withCardSurface(surfaceClassName: string) {
  return function wrapWithCardSurface<P extends { className?: string }>(
    Base: ComponentType<P>,
  ): ComponentType<P> {
    function WithCardSurface(props: P) {
      return <Base {...props} className={cn(surfaceClassName, props.className)} />
    }
    const name = Base.displayName || Base.name || 'Component'
    WithCardSurface.displayName = `withCardSurface(${name})`
    return WithCardSurface
  }
}
