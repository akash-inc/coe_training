import { useEffect, useMemo, useRef, useState } from 'react'

function useDebouncedValue(value, delay, enabled) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    if (!enabled) {
      const immediateId = window.setTimeout(() => {
        setDebouncedValue(value)
      }, 0)

      return () => {
        window.clearTimeout(immediateId)
      }
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delay, enabled, value])

  return debouncedValue
}

function useThrottledValue(value, interval, enabled) {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRunRef = useRef(0)
  const trailingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      const immediateId = window.setTimeout(() => {
        setThrottledValue(value)
      }, 0)

      return () => {
        window.clearTimeout(immediateId)
      }
    }

    const now = Date.now()
    const elapsed = now - lastRunRef.current

    if (elapsed >= interval) {
      setThrottledValue(value)
      lastRunRef.current = now
      return
    }

    const remaining = interval - elapsed
    trailingTimeoutRef.current = window.setTimeout(() => {
      setThrottledValue(value)
      lastRunRef.current = Date.now()
      trailingTimeoutRef.current = null
    }, remaining)

    return () => {
      if (trailingTimeoutRef.current !== null) {
        window.clearTimeout(trailingTimeoutRef.current)
        trailingTimeoutRef.current = null
      }
    }
  }, [enabled, interval, value])

  return throttledValue
}

function useDashboardFilters({ enableDebounce, enableThrottle }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [maxPrice, setMaxPrice] = useState(2000)
  const [sortBy, setSortBy] = useState('name-asc')

  const debouncedSearch = useDebouncedValue(searchTerm, 300, enableDebounce)
  const throttledCategory = useThrottledValue(
    selectedCategory,
    300,
    enableThrottle,
  )
  const throttledSortBy = useThrottledValue(sortBy, 300, enableThrottle)
  const throttledMaxPrice = useThrottledValue(maxPrice, 300, enableThrottle)

  const effectiveFilters = useMemo(
    () => ({
      searchTerm: debouncedSearch,
      category: throttledCategory,
      maxPrice: throttledMaxPrice,
      sortBy: throttledSortBy,
    }),
    [debouncedSearch, throttledCategory, throttledMaxPrice, throttledSortBy],
  )

  return {
    searchTerm,
    selectedCategory,
    maxPrice,
    sortBy,
    setSearchTerm,
    setSelectedCategory,
    setMaxPrice,
    setSortBy,
    effectiveFilters,
  }
}

export default useDashboardFilters
