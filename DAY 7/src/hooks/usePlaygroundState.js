import { useEffect, useState } from 'react'
import { buildItems, expensiveFilter } from '../components/performanceData.js'

const ALL_ITEMS = buildItems(2400)
const DEBOUNCE_DELAY_MS = 300

function usePlaygroundState() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [count, setCount] = useState(0)
  const [showDetails, setShowDetails] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [query])

  const filteredItems = expensiveFilter(ALL_ITEMS, debouncedQuery)

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
  }

  const incrementCount = () => {
    setCount((value) => value + 1)
  }

  const toggleDetails = () => {
    setShowDetails((value) => !value)
  }

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
