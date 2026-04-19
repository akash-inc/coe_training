import { useCallback, useEffect, useRef, useState } from 'react'
import { buildItems, expensiveFilter } from '../components/performanceData.js'

const ALL_ITEMS = buildItems(2400)
const DEBOUNCE_DELAY_MS = 300
const THROTTLE_INTERVAL_MS = 200

function usePlaygroundState() {
  const [query, setQuery] = useState('')
  const [throttledQuery, setThrottledQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [count, setCount] = useState(0)
  const [showDetails, setShowDetails] = useState(true)
  const lastThrottleTimestampRef = useRef(0)
  const trailingTimeoutRef = useRef(null)

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastThrottleTimestampRef.current

    if (elapsed >= THROTTLE_INTERVAL_MS) {
      setThrottledQuery(query)
      lastThrottleTimestampRef.current = now
      return
    }

    const remaining = THROTTLE_INTERVAL_MS - elapsed
    trailingTimeoutRef.current = window.setTimeout(() => {
      setThrottledQuery(query)
      lastThrottleTimestampRef.current = Date.now()
      trailingTimeoutRef.current = null
    }, remaining)

    return () => {
      if (trailingTimeoutRef.current !== null) {
        window.clearTimeout(trailingTimeoutRef.current)
        trailingTimeoutRef.current = null
      }
    }
  }, [query])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(throttledQuery)
    }, DEBOUNCE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [throttledQuery])

  const filteredItems = expensiveFilter(ALL_ITEMS, debouncedQuery)

  const handleQueryChange = useCallback((event) => {
    setQuery(event.target.value)
  }, [])

  const incrementCount = useCallback(() => {
    setCount((value) => value + 1)
  }, [])

  const toggleDetails = useCallback(() => {
    setShowDetails((value) => !value)
  }, [])

  return {
    query,
    count,
    showDetails,
    filteredItems,
    handleQueryChange,
    incrementCount,
    toggleDetails,
  }
}

export default usePlaygroundState
