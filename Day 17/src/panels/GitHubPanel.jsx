import { useInfiniteFeed } from '../hooks/useInfiniteFeed'
import { fetchGitHub } from '../api/github'
import FeedList from '../components/FeedList'

export default function GitHubPanel() {
  const feed = useInfiniteFeed({
    queryKey: ['feed', 'github'],
    queryFn: ({ pageParam }) => fetchGitHub({ page: pageParam }),
    initialPageParam: 1, // GitHub pages are 1-based
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  })
  return <FeedList {...feed} />
}
