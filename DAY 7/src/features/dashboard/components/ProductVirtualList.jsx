import { List } from 'react-window'
import { markRender } from '../../../components/RenderCounter.js'
import ProductRow from './ProductRow.jsx'

function ProductVirtualList({
  visibleProducts,
  filteredCount,
  handleRowsRendered,
  loadMore,
  favorites,
  onToggleFavorite,
  enableVirtualization,
  enableMemoization,
}) {
  markRender('DashboardProductVirtualList')

  return (
    <section className="panel dashboard-panel">
      <h3>Large Product Table</h3>
      <p className="exercise-objective">
        Showing {visibleProducts.length} of {filteredCount} filtered products.
      </p>

      <div className="dashboard-list-box">
        {enableVirtualization ? (
          <List
            rowComponent={ProductRow}
            rowCount={visibleProducts.length}
            rowHeight={96}
            rowProps={{
              products: visibleProducts,
              favorites,
              onToggleFavorite,
              enableMemoization,
            }}
            onRowsRendered={handleRowsRendered}
            style={{ height: 520 }}
          />
        ) : (
          <div>
            {visibleProducts.map((product, index) => (
              <ProductRow
                key={product.id}
                index={index}
                style={undefined}
                ariaAttributes={undefined}
                products={visibleProducts}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                enableMemoization={enableMemoization}
              />
            ))}
          </div>
        )}
      </div>

      <div className="button-row">
        <button type="button" onClick={loadMore}>
          Load next batch
        </button>
      </div>
    </section>
  )
}

export default ProductVirtualList
