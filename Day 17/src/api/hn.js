// Hacker News via the Algolia API. CORS-friendly and page-based.
const BASE = 'https://hn.algolia.com/api/v1/search_by_date'

function normalize(hit) {
  return {
    id: `hn-${hit.objectID}`,
    source: 'hn',
    sourceId: hit.objectID,
    title: hit.title || hit.story_title || '(untitled)',
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    points: hit.points ?? 0,
    comments: hit.num_comments ?? 0,
    author: hit.author,
    time: hit.created_at,
    summary: hit.story_text || '',
  }
}

// page is 0-based (Algolia convention).
export async function fetchHN({ page = 0, perPage = 20 } = {}) {
  const res = await fetch(`${BASE}?tags=story&hitsPerPage=${perPage}&page=${page}`)
  if (!res.ok) throw new Error(`Hacker News request failed (${res.status})`)
  const data = await res.json()
  return {
    items: (data.hits || []).filter((h) => h.title).map(normalize),
    page: data.page,
    nbPages: data.nbPages,
  }
}
