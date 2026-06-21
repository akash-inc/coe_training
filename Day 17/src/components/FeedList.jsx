import FeedCard from './FeedCard'
import RenderProfiler from './RenderProfiler'

// Presentational list shared by all source panels. The infinite-scroll
// machinery lives in useInfiniteFeed; this just renders cards and the sentinel.
export default function FeedList({ items, sentinelRef, hasNextPage, isFetchingNextPage }) {
  return (
    <RenderProfiler id="feed-list">
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
    </RenderProfiler>
  )
}
