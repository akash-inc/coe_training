// GitHub Search API. CORS-friendly, page-based. Unauthenticated requests are
// rate-limited to ~60/hr — a 403 here is surfaced as an isolated feed error
// (see the error-boundary step) rather than crashing the whole app.
const SEARCH = 'https://api.github.com/search/repositories'

function normalize(repo) {
  return {
    id: `gh-${repo.id}`,
    source: 'github',
    sourceId: repo.full_name,
    title: repo.full_name,
    url: repo.html_url,
    points: repo.stargazers_count ?? 0,
    comments: repo.open_issues_count ?? 0,
    author: repo.owner?.login,
    time: repo.pushed_at,
    summary: repo.description || '',
  }
}

// page is 1-based (GitHub convention).
export async function fetchGitHub({ page = 1, perPage = 20 } = {}) {
  const url = `${SEARCH}?q=stars:>1000&sort=stars&order=desc&per_page=${perPage}&page=${page}`
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
  if (res.status === 403) throw new Error('GitHub rate limit reached — try again later')
  if (!res.ok) throw new Error(`GitHub request failed (${res.status})`)
  const data = await res.json()
  return {
    items: (data.items || []).map(normalize),
    page,
    // Search API caps results at 1000 items.
    hasMore: page * perPage < Math.min(data.total_count ?? 0, 1000),
  }
}

// README fetched as raw markdown for the article page (rendered with marked).
export async function fetchGitHubReadme(fullName) {
  const res = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
    headers: { Accept: 'application/vnd.github.raw+json' },
  })
  if (!res.ok) throw new Error(`Could not load README for ${fullName} (${res.status})`)
  return res.text()
}
