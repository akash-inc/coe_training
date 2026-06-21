import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchGitHub } from '../api/github'
import FeedCard from '../components/FeedCard'

export default function GitHubPanel() {
  const { data } = useSuspenseQuery({
    queryKey: ['feed', 'github', 1],
    queryFn: () => fetchGitHub({ page: 1 }),
  })

  return (
    <div className="feed-list">
      {data.items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  )
}
