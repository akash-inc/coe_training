export function computePriceDetails(basePrice, stock, rating) {
  let price = basePrice

  // Simulate expensive derived pricing logic.
  for (let i = 0; i < 8000; i += 1) {
    price += Math.sin((i + stock) % 31) * 0.00002
  }

  const demandMultiplier = rating > 4.5 ? 1.08 : rating > 4 ? 1.04 : 1
  const stockDiscount = stock < 20 ? 1.03 : stock > 300 ? 0.92 : 1
  const finalPrice = Number((price * demandMultiplier * stockDiscount).toFixed(2))
  const discountPercent = Number(((1 - finalPrice / basePrice) * 100).toFixed(1))

  return {
    finalPrice,
    discountPercent,
    badge: stock < 20 ? 'Low Stock' : stock > 300 ? 'Bulk Ready' : 'Regular',
  }
}
