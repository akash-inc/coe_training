import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <section className="panel">
      <h2>Welcome</h2>
      <p>
        This small app is written badly on purpose. Your job is to open the
        Playground, see what is slow, and fix one thing at a time.
      </p>
      <p>How to use this lab:</p>
      <ol>
        <li>Open the Playground (link below).</li>
        <li>
          Read each exercise card. The heading tells you what to learn.
        </li>
        <li>
          Measure first using React DevTools Profiler. Do not guess.
        </li>
        <li>
          Fix one exercise, then switch its status toggle from <strong>red</strong> to <strong>green</strong>.
        </li>
      </ol>
      <Link className="primary-link" to="/playground">
        Open Playground
      </Link>
    </section>
  )
}

export default HomePage
