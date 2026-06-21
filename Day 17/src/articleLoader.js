// Shared article data loader used by BOTH the hover-prefetch hook and the
// article page, so they hit the same query cache key and a hovered card makes
// navigation instant.
//
// Every source fetcher is imported *dynamically* so this module stays free of
// heavy static deps (fast-xml-parser, etc.). That's what lets FeedCard import
// it without dragging the RSS parser into the feed chunk.
//
// Returns a normalized shape: { title, body, format: 'markdown' | 'html', externalUrl }.
// marked is applied later (only on the article page) — never here.

export const articleKey = (source, id) => ['article', source, id]

export async function loadArticle(source, id, item) {
  if (source === 'github') {
    const { fetchGitHubReadme } = await import('./api/github')
    return {
      title: id,
      body: await fetchGitHubReadme(id),
      format: 'markdown',
      externalUrl: `https://github.com/${id}`,
    }
  }

  if (source === 'hn') {
    const { fetchHNItem } = await import('./api/hn')
    const d = await fetchHNItem(id)
    return {
      title: d.title,
      body: d.text || '',
      format: 'html',
      externalUrl: d.url || `https://news.ycombinator.com/item?id=${id}`,
    }
  }

  // RSS: when prefetching from a card we already have the full content on the
  // item, so we can skip the network (and the parser) entirely.
  if (item?.content != null) {
    return { title: item.title, body: item.content, format: 'html', externalUrl: item.url }
  }
  const { fetchRSSItem } = await import('./api/rss')
  const r = await fetchRSSItem(id)
  return { title: r.title, body: r.content, format: 'html', externalUrl: r.url }
}
