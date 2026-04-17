import { useState } from 'react'
import heroImage from './assets/hero.png'
import { AccessibilityChecklist } from './features/accessibility-checklist/components/AccessibilityChecklist'
import { AccessiblePipelineChart } from './features/charts/components/AccessiblePipelineChart'
import { ComboboxFeature } from './features/combobox/components/ComboboxFeature'
import { ApplicationBoard } from './features/drag-drop/components/ApplicationBoard'
import { ResumeUpload } from './features/file-upload/components/ResumeUpload'
import { InfiniteScrollAnnouncer } from './features/infinite-scroll/components/InfiniteScrollAnnouncer'
import { AccessibleMobileImage } from './features/mobile-accessibility/components/AccessibleMobileImage'
import MultiStepApplicationForm from './features/multi-step-form/components/MultiStepApplicationForm'
import './App.css'

const TOTAL_RESULTS = 20
const BATCH_SIZE = 4
const INITIAL_RESULTS = Array.from({ length: 8 }, (_, index) => `Job result ${index + 1}`)

const pipelineData = [
  { stage: 'Saved', count: 12 },
  { stage: 'Applied', count: 8 },
  { stage: 'Interview', count: 3 },
  { stage: 'Offer', count: 1 },
]

function App() {
  const [results, setResults] = useState(INITIAL_RESULTS)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [lastLoadedCount, setLastLoadedCount] = useState(0)

  const hasMoreResults = results.length < TOTAL_RESULTS
  const loadedAnnouncement =
    lastLoadedCount > 0 ? `${lastLoadedCount} more results loaded.` : ''

  const handleLoadMoreResults = () => {
    if (!hasMoreResults || isLoadingResults) {
      return
    }

    setIsLoadingResults(true)
    window.setTimeout(() => {
      setResults((currentResults) => {
        const remaining = TOTAL_RESULTS - currentResults.length
        const countToAdd = Math.min(BATCH_SIZE, remaining)
        const nextResults = Array.from(
          { length: countToAdd },
          (_, index) => `Job result ${currentResults.length + index + 1}`,
        )
        setLastLoadedCount(countToAdd)
        return [...currentResults, ...nextResults]
      })
      setIsLoadingResults(false)
    }, 350)
  }

  return (
    <main className="app-shell">
      <header className="app-shell__header">
        <h1>JobTrail accessibility lab</h1>
        <p>
          One workspace that combines all Day 4 accessibility practices in a realistic
          job-application flow.
        </p>
      </header>

      <section className="app-shell__section" aria-labelledby="role-search-title">
        <h2 id="role-search-title">Role search (combobox)</h2>
        <ComboboxFeature />
      </section>

      <section className="app-shell__section" aria-labelledby="results-title">
        <h2 id="results-title">Job results (infinite scroll announcements)</h2>
        <InfiniteScrollAnnouncer
          hasMore={hasMoreResults}
          isLoading={isLoadingResults}
          onLoadMore={handleLoadMoreResults}
          loadingAnnouncement="Loading more job results..."
          loadedAnnouncement={loadedAnnouncement}
        >
          <ul className="app-shell__results">
            {results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
          <button type="button" onClick={handleLoadMoreResults} disabled={!hasMoreResults}>
            {hasMoreResults ? 'Load more results' : 'No more results'}
          </button>
        </InfiniteScrollAnnouncer>
      </section>

      <section className="app-shell__section" aria-labelledby="board-title">
        <h2 id="board-title">Application board (accessible drag and drop)</h2>
        <ApplicationBoard />
      </section>

      <section className="app-shell__section" aria-labelledby="chart-title">
        <h2 id="chart-title">Pipeline analytics (accessible chart)</h2>
        <AccessiblePipelineChart
          title="Application pipeline"
          description="Most applications are currently in Saved and Applied stages."
          data={pipelineData}
        />
      </section>

      <section className="app-shell__section" aria-labelledby="multi-step-title">
        <h2 id="multi-step-title">Application wizard (multi-step form)</h2>
        <MultiStepApplicationForm />
      </section>

      <section className="app-shell__section" aria-labelledby="upload-title">
        <h2 id="upload-title">Resume upload (errors, loading, toasts)</h2>
        <ResumeUpload />
      </section>

      <section className="app-shell__section" aria-labelledby="mobile-image-title">
        <h2 id="mobile-image-title">Mobile image accessibility</h2>
        <AccessibleMobileImage
          src={heroImage}
          alt="Colorful accessibility dashboard illustration"
          caption="Zoom-friendly image card with large touch targets"
        />
      </section>

      <section className="app-shell__section" aria-labelledby="checklist-title">
        <h2 id="checklist-title">Team QA checklist</h2>
        <AccessibilityChecklist />
      </section>
    </main>
  )
}

export default App
