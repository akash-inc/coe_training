import { memo } from 'react'
import { markRender } from '../../../components/RenderCounter.js'
import ProductCardMeta from './ProductCardMeta.jsx'

function ProductRow({
  index,
  style,
  ariaAttributes,
  products,
  favorites,
  onToggleFavorite,
  enableMemoization,
}) {
  const product = products[index]
  markRender('DashboardProductRow')

  if (!product) {
    return null
  }

  const isFavorite = favorites.has(product.id)

  return (
    <div className="dashboard-row" style={style} {...ariaAttributes}>
      <img src={product.imageUrl} alt="" width="48" height="48" loading="lazy" />
      <div className="dashboard-row-content">
        <strong>{product.name}</strong>
        <span>
          {product.category} | Stock {product.stock}
        </span>
        <ProductCardMeta
          product={product}
          enableMemoization={enableMemoization}
        />
      </div>
      <button type="button" onClick={() => onToggleFavorite(product.id)}>
        {isFavorite ? 'Unfavorite' : 'Favorite'}
      </button>
    </div>
  )
}

export default memo(ProductRow)
