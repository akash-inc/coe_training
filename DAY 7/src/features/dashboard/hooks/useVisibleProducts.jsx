import { useCallback, useMemo, useState } from 'react'

const INITIAL_BATCH_SIZE = 200
const NEXT_BATCH_SIZE = 200

function sortProducts(products, sortBy) {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.basePrice - b.basePrice)
      break
    case 'price-desc':
      sorted.sort((a, b) => b.basePrice - a.basePrice)
      break
    case 'stock-desc':
      sorted.sort((a, b) => b.stock - a.stock)
      break
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  return sorted
}

function computeFilteredProducts(products, filters) {
  const startedAt = performance.now()
  const normalizedSearch = filters.searchTerm.trim().toLowerCase()

  const filtered = products.filter((product) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch)
    const matchesCategory =
      filters.category === 'All' || product.category === filters.category
    const matchesPrice = product.basePrice <= filters.maxPrice

    return matchesSearch && matchesCategory && matchesPrice
  })

  const sorted = sortProducts(filtered, filters.sortBy)

  return {
    products: sorted,
    filterDurationMs: Number((performance.now() - startedAt).toFixed(2)),
  }
}

function useVisibleProducts({ products, filters, enableMemoization }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE)

  const memoizedResult = useMemo(
    () => computeFilteredProducts(products, filters),
    [products, filters],
  )

  const activeResult = enableMemoization
    ? memoizedResult
    : computeFilteredProducts(products, filters)

  const clampedVisibleCount = Math.min(visibleCount, activeResult.products.length)

  const loadMore = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + NEXT_BATCH_SIZE, activeResult.products.length),
    )
  }, [activeResult.products.length])

  const handleRowsRendered = useCallback(
    (visibleRows) => {
      if (
        visibleRows.stopIndex >= clampedVisibleCount - 20 &&
        clampedVisibleCount < activeResult.products.length
      ) {
        loadMore()
      }
    },
    [activeResult.products.length, clampedVisibleCount, loadMore],
  )

  return {
    filteredProducts: activeResult.products,
    visibleProducts: activeResult.products.slice(0, clampedVisibleCount),
    visibleCount: clampedVisibleCount,
    filterDurationMs: activeResult.filterDurationMs,
    handleRowsRendered,
    loadMore,
  }
}

export default useVisibleProducts
