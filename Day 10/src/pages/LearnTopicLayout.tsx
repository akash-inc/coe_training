import { Link, Outlet, useParams, Navigate } from 'react-router-dom'
import { getLearnTopic, learnTopics } from '../data/learnTopics'
import { LearnNarrative } from '../components/learn/LearnNarrative'
import { GlobalErrorBanner } from '../components/GlobalErrorBanner'
import { WorkspaceHeader } from '../components/WorkspaceHeader'

function LearnNav() {
  const { slug } = useParams()
  if (!slug) {
    return null
  }
  const idx = learnTopics.findIndex((t) => t.slug === slug)
  const prev = idx > 0 ? learnTopics[idx - 1] : null
  const next = idx >= 0 && idx < learnTopics.length - 1 ? learnTopics[idx + 1] : null
  const topic = getLearnTopic(slug)
  if (!topic) {
    return null
  }
  return (
    <nav className="learn-nav" aria-label="Topic navigation">
      <Link className="learn-nav__back" to="/learn">
        All topics
      </Link>
      {prev && (
        <Link className="learn-nav__step" to={`/learn/${prev.slug}/tasks`}>
          Previous
        </Link>
      )}
      {next && (
        <Link className="learn-nav__step" to={`/learn/${next.slug}/tasks`}>
          Next
        </Link>
      )}
    </nav>
  )
}

export function LearnTopicLayout() {
  const { slug } = useParams()
  const topic = getLearnTopic(slug)

  if (!topic) {
    return <Navigate to="/learn" replace />
  }

  return (
    <div className="learn-page">
      <LearnNav />
      <LearnNarrative topic={topic} />
      <p className="learn-callout" role="note">
        <span className="learn-callout__label">This page focus</span>
        {topic.callout}
      </p>
      <div
        className="demo-workspace"
        data-demo-focus={topic.focus}
      >
        <div className="demo-region demo-region--banner" data-region="banner">
          <GlobalErrorBanner />
        </div>
        <div data-region="header" className="demo-region-header-wrap">
          <WorkspaceHeader />
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export function LearnSlugIndexRedirect() {
  const { slug } = useParams()
  if (!slug) {
    return <Navigate to="/learn" replace />
  }
  return <Navigate to={`/learn/${slug}/tasks`} replace />
}
