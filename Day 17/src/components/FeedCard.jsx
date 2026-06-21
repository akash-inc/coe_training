import { Link } from 'react-router-dom'

const SOURCE_LABEL = { hn: 'HN', github: 'GitHub', rss: 'RSS' }

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function FeedCard({ item }) {
  const articlePath = `/article/${item.source}/${encodeURIComponent(item.sourceId)}`

  return (
    <article className="card">
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
