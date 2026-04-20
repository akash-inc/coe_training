import { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import { markRender } from '../../components/RenderCounter.js'
import DashboardToolbar from './components/DashboardToolbar.jsx'
import ProductVirtualList from './components/ProductVirtualList.jsx'
import OptimizationToggles from './components/OptimizationToggles.jsx'
import PerformanceMetricsPanel from './components/PerformanceMetricsPanel.jsx'
import ComputeBenchPanel from './components/ComputeBenchPanel.jsx'
import useDashboardFilters from './hooks/useDashboardFilters.jsx'
import useVisibleProducts from './hooks/useVisibleProducts.jsx'
import useRenderMetrics from './hooks/useRenderMetrics.jsx'
import { generateProducts, getCategories } from './data/generateProducts.js'
import './dashboard.css'

const AnalyticsSection = lazy(() => import('./components/AnalyticsSection.jsx'))

const DEFAULT_OPTIMIZATIONS = {
  enableMemoization: true,
  enableCallbacks: true,
  enableDebounce: true,
  enableThrottle: true,
  enableVirtualization: true,
  enableWorkers: true,
}

function DashboardLab() {
  markRender('DashboardLab')
  const [optimizations, setOptimizations] = useState(DEFAULT_OPTIMIZATIONS)
  const [favorites, setFavorites] = useState(new Set())

  const products = useMemo(() => generateProducts(12000), [])
  const categories = useMemo(() => getCategories(products), [products])

  const filters = useDashboardFilters({
    enableDebounce: optimizations.enableDebounce,
    enableThrottle: optimizations.enableThrottle,
  })

  const {
    filteredProducts,
    visibleProducts,
    visibleCount,
    filterDurationMs,
    handleRowsRendered,
    loadMore,
  } = useVisibleProducts({
    products,
    filters: filters.effectiveFilters,
    enableMemoization: optimizations.enableMemoization,
  })

  const { renderSnapshot, clearRenderMetrics } = useRenderMetrics()

  const stableToggleFavorite = useCallback((productId) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }, [])

  const toggleFavorite = optimizations.enableCallbacks
    ? stableToggleFavorite
    : (productId) => {
        setFavorites((current) => {
          const next = new Set(current)
          if (next.has(productId)) {
            next.delete(productId)
          } else {
            next.add(productId)
          }
          return next
        })
      }

  const toggleOptimization = useCallback((toggleName) => {
    setOptimizations((current) => ({
      ...current,
      [toggleName]: !current[toggleName],
    }))
  }, [])

  return (
    <div className="dashboard-lab">
      <section className="panel dashboard-panel">
        <h2>Product Dashboard Capstone</h2>
        <p className="exercise-objective">
          This route demonstrates all performance techniques from the exercises
          in one realistic workflow.
        </p>
      </section>

      <OptimizationToggles
        toggles={optimizations}
        onToggleChange={toggleOptimization}
      />

      <DashboardToolbar
        searchTerm={filters.searchTerm}
        onSearchChange={(event) => filters.setSearchTerm(event.target.value)}
        selectedCategory={filters.selectedCategory}
        onCategoryChange={(event) => filters.setSelectedCategory(event.target.value)}
        maxPrice={filters.maxPrice}
        onMaxPriceChange={(event) => filters.setMaxPrice(Number(event.target.value))}
        sortBy={filters.sortBy}
        onSortByChange={(event) => filters.setSortBy(event.target.value)}
        categories={categories}
      />

      <PerformanceMetricsPanel
        totalProducts={products.length}
        filteredCount={filteredProducts.length}
        visibleCount={visibleCount}
        favoritesCount={favorites.size}
        filterDurationMs={filterDurationMs}
        renderSnapshot={renderSnapshot}
        onClearMetrics={clearRenderMetrics}
      />

      <ProductVirtualList
        visibleProducts={visibleProducts}
        filteredCount={filteredProducts.length}
        handleRowsRendered={handleRowsRendered}
        loadMore={loadMore}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        enableVirtualization={optimizations.enableVirtualization}
        enableMemoization={optimizations.enableMemoization}
      />

      <Suspense fallback={<section className="panel">Loading analytics...</section>}>
        <AnalyticsSection products={filteredProducts} />
      </Suspense>

      <ComputeBenchPanel enableWorkers={optimizations.enableWorkers} />
    </div>
  )
}

export default DashboardLab
