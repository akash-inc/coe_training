import type { LearnTopic } from '../../data/learnTopics'

type LearnNarrativeProps = {
  topic: LearnTopic
}

export function LearnNarrative({ topic }: LearnNarrativeProps) {
  return (
    <div className="learn-narrative">
      <h1 className="learn-narrative__title">{topic.title}</h1>
      <div className="learn-narrative__columns">
        <section
          className="learn-narrative__section learn-narrative__section--half"
          aria-labelledby="learn-technical"
        >
          <h2 id="learn-technical" className="learn-narrative__h2">
            How it works
          </h2>
          <div className="learn-narrative__body">
            {topic.bodyTechnical.split('\n\n').map((p, i) => (
              <p key={`t-${i}`} className="learn-narrative__p">
                {p}
              </p>
            ))}
          </div>
        </section>
        <section
          className="learn-narrative__section learn-narrative__section--half"
          aria-labelledby="learn-plain"
        >
          <h2 id="learn-plain" className="learn-narrative__h2">
            In plain English
          </h2>
          <div className="learn-narrative__body learn-narrative__body--plain">
            {topic.bodyPlain.split('\n\n').map((p, i) => (
              <p key={`p-${i}`} className="learn-narrative__p">
                {p}
              </p>
            ))}
          </div>
        </section>
      </div>
      <section
        className="learn-narrative__section learn-narrative__section--tryit"
        aria-labelledby="learn-tryit"
      >
        <h2 id="learn-tryit" className="learn-narrative__h2">
          Try it
        </h2>
        <p className="learn-narrative__p learn-narrative__tryit-intro">{topic.tryItIntro}</p>
        <ol className="learn-narrative__tryit-ol">
          {topic.tryItSteps.map((step, i) => (
            <li key={`try-${i}`} className="learn-narrative__tryit-li">
              {step}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
