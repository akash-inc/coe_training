const CATEGORIES = ['Electronics', 'Apparel', 'Home', 'Sports', 'Books']

function randomBetween(min, max, seed) {
  return min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min)
}

export function generateProducts(total = 12000) {
  return Array.from({ length: total }, (_, index) => {
    const id = index + 1
    const category = CATEGORIES[index % CATEGORIES.length]
    const basePrice = Number(randomBetween(15, 2000, id).toFixed(2))
    const stock = Math.floor(randomBetween(0, 500, id + 13))
    const rating = Number(randomBetween(2.5, 5, id + 29).toFixed(1))

    return {
      id,
      name: `Product ${id}`,
      category,
      basePrice,
      stock,
      rating,
      imageUrl: `https://picsum.photos/seed/product-${id}/56/56`,
    }
  })
}

export function getCategories(products) {
  return [...new Set(products.map((product) => product.category))]
}
