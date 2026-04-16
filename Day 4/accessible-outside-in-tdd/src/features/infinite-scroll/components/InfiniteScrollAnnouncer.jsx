import { useEffect, useRef } from 'react'
import './InfiniteScrollAnnouncer.css'

export function InfiniteScrollAnnouncer({
  hasMore,
  isLoading,
  onLoadMore,
  loadingAnnouncement,
  loadedAnnouncement,
  children,
}) {
  const sentinelRef = useRef(null)
  const statusRef = useRef(null)
  const wasLoadingRef = useRef(false)

  useEffect(() => {
    if (!sentinelRef.current || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      const isSentinelVisible = entries.some((entry) => entry.isIntersecting)

      if (isSentinelVisible && hasMore && !isLoading) {
        onLoadMore()
      }
    })
    observer.observe(sentinelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading, onLoadMore])

  useEffect(() => {
    if (!statusRef.current) {
      return
    }

    if (isLoading) {
      statusRef.current.textContent = loadingAnnouncement
    } else if (wasLoadingRef.current && loadedAnnouncement) {
      statusRef.current.textContent = loadedAnnouncement
    } else {
      statusRef.current.textContent = ''
    }

    wasLoadingRef.current = isLoading
  }, [isLoading, loadingAnnouncement, loadedAnnouncement])

  return (
    <section className="infinite-scroll-announcer">
      {children}
      <div
        ref={statusRef}
        className="infinite-scroll-announcer__status sr-only"
        role="status"
        aria-live="polite"
      ></div>
      <div ref={sentinelRef} className="infinite-scroll-announcer__sentinel" aria-hidden="true"></div>
    </section>
  )
}