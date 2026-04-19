import { useState } from 'react'
import { buildItems, expensiveFilter } from '../components/performanceData.js'

const ALL_ITEMS = buildItems(2400)

function usePlaygroundState() {
  const [query, setQuery] = useState('')
  const [count, setCount] = useState(0)
  const [showDetails, setShowDetails] = useState(true)

  const filteredItems = expensiveFilter(ALL_ITEMS, query)

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
