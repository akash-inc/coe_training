import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchHN } from '../api/hn'
import FeedCard from '../components/FeedCard'

// useSuspenseQuery suspends until data is ready (skeletons show via the
// enclosing Suspense fallback) and throws errors to the error boundary —
// so there are no isPending/isError branches to hand-write.
export default function HNPanel() {
  const { data } = useSuspenseQuery({
    queryKey: ['feed', 'hn', 0],
    queryFn: () => fetchHN({ page: 0 }),
  })

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
