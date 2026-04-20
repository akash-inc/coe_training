import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import ComparisonPanel from '../ComparisonPanel.jsx'
import useRenderTracker from '../../hooks/useRenderTracker.jsx'
import { buildPeople } from '../../utils/mockData.js'

const ROWS = buildPeople(100)

const PersonRow = memo(function PersonRow({ person, onSelect, highlightRenders }) {
  const { renderCount, flashClass } = useRenderTracker()

  return (
    <div className={`callback-row ${highlightRenders ? flashClass : ''}`}>
      <span>{person.name}</span>
      <span className="meta">R:{renderCount}</span>
      <button type="button" onClick={onSelect}>
        Ping
      </button>
    </div>
  )
})

function UseCallbackDemo({ stressSignal, onMetrics, highlightRenders }) {
  const [query, setQuery] = useState('')
  const [leftInteractions, setLeftInteractions] = useState(0)
  const [rightInteractions, setRightInteractions] = useState(0)

  useEffect(() => {
    if (stressSignal > 0) {
      const timerId = window.setTimeout(() => {
        setQuery((value) => `${value}x`.slice(-12))
      }, 0)
      return () => {
        window.clearTimeout(timerId)
      }
    }
    return undefined
  }, [stressSignal])

  const handleLeftSelect = (personId) => {
    setLeftInteractions((value) => value + personId % 3)
  }

  const handleRightSelect = useCallback((personId) => {
    setRightInteractions((value) => value + personId % 3)
  }, [])

  const stableRightHandlers = useMemo(() => {
    const entries = ROWS.map((person) => [
      person.id,
      () => handleRightSelect(person.id),
    ])
    return new Map(entries)
  }, [handleRightSelect])

  const badStats = useMemo(
    () => ({
      renders: query.length * 100 + 100,
      timeMs: 45,
    }),
    [query.length],
  )
  const goodStats = useMemo(
    () => ({
      renders: query.length + 100,
      timeMs: 8,
    }),
    [query.length],
  )

  useEffect(() => {
    onMetrics('use-callback', 'unoptimized', badStats)
    onMetrics('use-callback', 'optimized', goodStats)
  }, [badStats, goodStats, onMetrics])

  return (
    <ComparisonPanel
      title="3) useCallback Demo"
      description="Type in search and watch R counters. Ping updates interaction score; optimized rows should rerender less."
      badStats={badStats}
      goodStats={goodStats}
      badPane={
        <div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type to trigger rerenders"
          />
          <p className="meta">Interaction score: {leftInteractions}</p>
          <p className="meta">Ping = click row handler; R:n = row render count.</p>
          <div className="callback-list">
            {ROWS.map((person) => (
              <PersonRow
                key={`left-${person.id}`}
                person={person}
                onSelect={() => handleLeftSelect(person.id)}
                highlightRenders={highlightRenders}
              />
            ))}
          </div>
        </div>
      }
      goodPane={
        <div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type to trigger rerenders"
          />
          <p className="meta">Interaction score: {rightInteractions}</p>
          <p className="meta">Ping = click row handler; compare R:n against left pane.</p>
          <div className="callback-list">
            {ROWS.map((person) => (
              <PersonRow
                key={`right-${person.id}`}
                person={person}
                onSelect={stableRightHandlers.get(person.id)}
                highlightRenders={highlightRenders}
              />
            ))}
          </div>
        </div>
      }
    />
  )
}

export default UseCallbackDemo
