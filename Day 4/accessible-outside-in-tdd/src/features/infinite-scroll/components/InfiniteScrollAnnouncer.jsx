import { useEffect, useRef } from 'react'

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
    <section>
      {children}
      <div
        ref={statusRef}
        role="status"
        aria-live="polite"
      ></div>
      <div ref={sentinelRef} aria-hidden="true"></div>
    </section>
  )
}