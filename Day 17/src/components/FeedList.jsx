import FeedCard from './FeedCard'

// Presentational list shared by all source panels. The infinite-scroll
// machinery lives in useInfiniteFeed; this just renders cards and the sentinel.
export default function FeedList({ items, sentinelRef, hasNextPage, isFetchingNextPage }) {
  return (
    <div className="feed-list">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
      {hasNextPage && (
        <div ref={sentinelRef} className="sentinel">
          {isFetchingNextPage ? 'Loading more…' : ''}
        </div>
      )}
    </div>
  )
}
