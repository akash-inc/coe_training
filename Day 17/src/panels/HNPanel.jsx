import { useQuery } from '@tanstack/react-query'
import { fetchHN } from '../api/hn'
import FeedCard from '../components/FeedCard'

export default function HNPanel() {
  // throwOnError lets the enclosing ErrorBoundary catch query failures
  // instead of each panel hand-rolling its own error UI.
  const { data, isPending } = useQuery({
    queryKey: ['feed', 'hn', 0],
    queryFn: () => fetchHN({ page: 0 }),
    throwOnError: true,
  })

  if (isPending) return <p className="feed-status">Loading Hacker News…</p>

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
