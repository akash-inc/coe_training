export function InfiniteScrollAnnouncer({ children }) {
  return (
    <section>
      {children}
      <div role="status" aria-live="polite"></div>
    </section>
  )
}