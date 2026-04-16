import { useEffect, useRef } from 'react'

export function InfiniteScrollAnnouncer({ children }) {
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!sentinelRef.current || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(() => {})
    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section>
      {children}
      <div role="status" aria-live="polite"></div>
      <div ref={sentinelRef} aria-hidden="true"></div>
    </section>
  )
}