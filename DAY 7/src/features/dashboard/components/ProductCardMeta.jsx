import { useMemo } from 'react'
import { computePriceDetails } from '../utils/pricing.js'

function ProductCardMeta({ product, enableMemoization }) {
  const memoizedDetails = useMemo(
    () => computePriceDetails(product.basePrice, product.stock, product.rating),
    [product.basePrice, product.rating, product.stock],
  )

  const details = enableMemoization
    ? memoizedDetails
    : computePriceDetails(product.basePrice, product.stock, product.rating)

  return (
    <div className="product-meta">
      <strong>${details.finalPrice}</strong>
      <span>{details.discountPercent}% delta</span>
      <span>{details.badge}</span>
      <span>Rating {product.rating}</span>
    </div>
  )
}

export default ProductCardMeta
