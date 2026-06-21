import { useQuery } from '@tanstack/react-query'
import { fetchGitHub } from '../api/github'
import FeedCard from '../components/FeedCard'

export default function GitHubPanel() {
  // throwOnError lets the enclosing ErrorBoundary catch query failures
  // (a 403 rate-limit here stays isolated to the GitHub tab).
  const { data, isPending } = useQuery({
    queryKey: ['feed', 'github', 1],
    queryFn: () => fetchGitHub({ page: 1 }),
    throwOnError: true,
  })

  if (isPending) return <p className="feed-status">Loading GitHub…</p>

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
