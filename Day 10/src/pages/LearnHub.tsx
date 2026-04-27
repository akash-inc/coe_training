import { Link } from 'react-router-dom'
import { learnTopics } from '../data/learnTopics'

export function LearnHub() {
  return (
    <div className="learn-hub">
      <header className="learn-hub__hero">
        <h1 className="learn-hub__title">Day 10 — React Query lab</h1>
        <p className="learn-hub__lede">
          Each page pairs a short guide with the same working task app. Open any topic, read both sections, then
          use the live demo. Use the top bar to move between topics or return here.
        </p>
      </header>
      <ul className="learn-hub__grid">
        {learnTopics.map((t) => (
          <li key={t.slug}>
            <Link className="learn-hub__card" to={`/learn/${t.slug}/tasks`}>
              <h2 className="learn-hub__card-title">{t.title}</h2>
              <p className="learn-hub__card-summary">{t.summaryPlain}</p>
              <span className="learn-hub__card-cta" aria-hidden="true">
                Open lesson
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
