import { useInfiniteFeed } from '../hooks/useInfiniteFeed'
import { fetchHN } from '../api/hn'
import FeedList from '../components/FeedList'

export default function HNPanel() {
  const feed = useInfiniteFeed({
    queryKey: ['feed', 'hn'],
    queryFn: ({ pageParam }) => fetchHN({ page: pageParam }),
    initialPageParam: 0, // Algolia pages are 0-based
    getNextPageParam: (last) =>
      last.page + 1 < last.nbPages ? last.page + 1 : undefined,
  })
  return <FeedList {...feed} />
}
