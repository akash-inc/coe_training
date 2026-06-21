import { useInfiniteFeed } from '../hooks/useInfiniteFeed'
import { fetchRSS } from '../api/rss'
import FeedList from '../components/FeedList'

export default function RSSPanel() {
  const feed = useInfiniteFeed({
    queryKey: ['feed', 'rss'],
    queryFn: ({ pageParam }) => fetchRSS({ cursor: pageParam }),
    initialPageParam: 0, // cursor = item offset into the parsed feed
    getNextPageParam: (last) => last.nextCursor,
  })
  return <FeedList {...feed} />
}
