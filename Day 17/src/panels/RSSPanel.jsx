import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchRSS } from '../api/rss'
import FeedCard from '../components/FeedCard'

export default function RSSPanel() {
  const { data } = useSuspenseQuery({
    queryKey: ['feed', 'rss', 0],
    queryFn: () => fetchRSS({ cursor: 0 }),
  })

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
