import { useQuery } from '@tanstack/react-query'
import { fetchRSS } from '../api/rss'
import FeedCard from '../components/FeedCard'

export default function RSSPanel() {
  // throwOnError lets the enclosing ErrorBoundary catch query failures
  // (the CORS proxy is flaky — failures stay isolated to the RSS tab).
  const { data, isPending } = useQuery({
    queryKey: ['feed', 'rss', 0],
    queryFn: () => fetchRSS({ cursor: 0 }),
    throwOnError: true,
  })

  if (isPending) return <p className="feed-status">Loading RSS…</p>

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
