import { useQuery } from '@tanstack/react-query'
import { fetchRSS } from '../api/rss'
import FeedCard from '../components/FeedCard'

export default function RSSPanel() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['feed', 'rss', 0],
    queryFn: () => fetchRSS({ cursor: 0 }),
  })

  if (isPending) return <p className="feed-status">Loading RSS…</p>
  if (isError) return <p className="feed-status feed-error">{error.message}</p>

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
