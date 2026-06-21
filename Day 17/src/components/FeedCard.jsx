import { memo } from 'react'
import { Link } from 'react-router-dom'
import { usePrefetchArticle } from '../hooks/usePrefetchArticle'

const SOURCE_LABEL = { hn: 'HN', github: 'GitHub', rss: 'RSS' }

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// memo so that appending a page only renders the *new* cards — existing cards
// receive the same `item` reference (React Query keeps page objects stable) and
// bail out. React Compiler already memoizes the mapped elements; this makes the
// guarantee explicit and survives even if the compiler is disabled.
function FeedCard({ item }) {
  const articlePath = `/article/${item.source}/${encodeURIComponent(item.sourceId)}`
  const prefetch = usePrefetchArticle()

  return (
    <article
      className="card"
      onMouseEnter={() => prefetch(item)}
      onFocus={() => prefetch(item)}
    >
      <div className="card-meta">
        <span className={`badge badge-${item.source}`}>{SOURCE_LABEL[item.source]}</span>
        {item.author && <span className="card-author">{item.author}</span>}
        <span className="card-time">{formatTime(item.time)}</span>
      </div>
      <h3 className="card-title">
        <Link to={articlePath}>{item.title}</Link>
      </h3>
      {item.summary && <p className="card-summary">{item.summary}</p>}
      <div className="card-stats">
        {item.source !== 'rss' && (
          <span>{item.source === 'github' ? '★' : '▲'} {item.points}</span>
        )}
        {item.source === 'hn' && <span>💬 {item.comments}</span>}
        <a className="card-source-link" href={item.url} target="_blank" rel="noreferrer">
          source ↗
        </a>
      </div>
    </article>
  )
}

export default memo(FeedCard)
