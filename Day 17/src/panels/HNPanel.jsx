import { useQuery } from '@tanstack/react-query'
import { fetchHN } from '../api/hn'
import FeedCard from '../components/FeedCard'

export default function HNPanel() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['feed', 'hn', 0],
    queryFn: () => fetchHN({ page: 0 }),
  })

  if (isPending) return <p className="feed-status">Loading Hacker News…</p>
  if (isError) return <p className="feed-status feed-error">{error.message}</p>

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
