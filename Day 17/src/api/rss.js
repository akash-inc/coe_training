import { XMLParser } from 'fast-xml-parser'

// RSS feeds rarely send CORS headers, so we go through a public proxy.
// allorigins can be flaky; failures surface as an isolated feed error.
const FEED_URL = 'https://css-tricks.com/feed/'
const PROXY = 'https://api.allorigins.win/raw?url='

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true })

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280)
}

function normalize(item, i) {
  const link = item.link?.['#text'] || item.link || ''
  return {
    id: `rss-${i}-${link}`,
    source: 'rss',
    sourceId: link,
    title: item.title || '(untitled)',
    url: link,
    points: 0,
    comments: 0,
    author: item['dc:creator'] || item.author || '',
    time: item.pubDate,
    summary: stripHtml(item.description || item['content:encoded'] || ''),
    // full content kept for the offline article view (rendered via marked)
    content: item['content:encoded'] || item.description || '',
  }
}

// RSS feeds are finite, so we fetch once and paginate over parsed items
// client-side. cursor = item offset; this mirrors a cursor-based API.
let cache = null
async function loadFeed() {
  if (cache) return cache
  const res = await fetch(`${PROXY}${encodeURIComponent(FEED_URL)}`)
  if (!res.ok) throw new Error(`RSS request failed (${res.status})`)
  const xml = await res.text()
  const parsed = parser.parse(xml)
  const items = parsed?.rss?.channel?.item ?? []
  cache = (Array.isArray(items) ? items : [items]).map(normalize)
  return cache
}

export async function fetchRSS({ cursor = 0, perPage = 10 } = {}) {
  const all = await loadFeed()
  const slice = all.slice(cursor, cursor + perPage)
  const nextCursor = cursor + perPage
  return {
    items: slice,
    cursor,
    nextCursor: nextCursor < all.length ? nextCursor : undefined,
  }
}
