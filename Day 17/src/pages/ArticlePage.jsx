import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { fetchGitHubReadme } from '../api/github'
import { fetchHNItem } from '../api/hn'
import { fetchRSSItem } from '../api/rss'

// Resolve {source,id} -> { title, html, externalUrl }. marked turns README
// markdown / RSS HTML into renderable markup. (A production app would sanitize
// the output with DOMPurify before dangerouslySetInnerHTML.)
async function loadArticle(source, id) {
  if (source === 'github') {
    const md = await fetchGitHubReadme(id)
    return { title: id, html: marked.parse(md), externalUrl: `https://github.com/${id}` }
  }
  if (source === 'rss') {
    const item = await fetchRSSItem(id)
    return { title: item.title, html: marked.parse(item.content || ''), externalUrl: item.url }
  }
  const item = await fetchHNItem(id)
  return {
    title: item.title,
    html: item.text ? marked.parse(item.text) : '<p>This story links out — open it below.</p>',
    externalUrl: item.url || `https://news.ycombinator.com/item?id=${id}`,
  }
}

export default function ArticlePage() {
  const { source, id } = useParams()
  const decoded = decodeURIComponent(id)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['article', source, decoded],
    queryFn: () => loadArticle(source, decoded),
  })

  return (
    <main className="feed article">
      <Link to="/" className="back-link">← Back to feed</Link>
      {isPending && <p className="feed-status">Loading article…</p>}
      {isError && <p className="feed-status feed-error">{error.message}</p>}
      {data && (
        <>
          <h1 className="article-title">{data.title}</h1>
          <a className="card-source-link" href={data.externalUrl} target="_blank" rel="noreferrer">
            Open original ↗
          </a>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: data.html }} />
        </>
      )}
    </main>
  )
}
