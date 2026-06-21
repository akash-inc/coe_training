import { useQuery } from '@tanstack/react-query'
import { fetchGitHub } from '../api/github'
import FeedCard from '../components/FeedCard'

export default function GitHubPanel() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['feed', 'github', 1],
    queryFn: () => fetchGitHub({ page: 1 }),
  })

  if (isPending) return <p className="feed-status">Loading GitHub…</p>
  if (isError) return <p className="feed-status feed-error">{error.message}</p>

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
