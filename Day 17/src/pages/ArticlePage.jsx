import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { marked } from 'marked'
import { articleKey, loadArticle } from '../articleLoader'

// marked lives only in this (lazy) route chunk. The cached data is raw
// markdown/HTML; we render it here so a hover-prefetched card hits the cache.
// (Production should sanitize with DOMPurify before dangerouslySetInnerHTML.)
export default function ArticlePage() {
  const { source, id } = useParams()
  const decoded = decodeURIComponent(id)

  const { data, isPending, isError, error } = useQuery({
    queryKey: articleKey(source, decoded),
    queryFn: () => loadArticle(source, decoded),
  })

  const html = useMemo(() => {
    if (!data) return ''
    return data.format === 'markdown' ? marked.parse(data.body) : data.body
  }, [data])

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
          <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </>
      )}
    </main>
  )
}
