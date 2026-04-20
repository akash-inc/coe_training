function StatisticsPanel({ products }) {
  const averagePrice =
    products.reduce((sum, item) => sum + item.basePrice, 0) /
    Math.max(products.length, 1)
  const averageStock =
    products.reduce((sum, item) => sum + item.stock, 0) /
    Math.max(products.length, 1)

  return (
    <section className="panel dashboard-panel">
      <h4>Statistics</h4>
      <p className="exercise-objective">Simple aggregated statistics.</p>
      <ul>
        <li>Average price: ${averagePrice.toFixed(2)}</li>
        <li>Average stock: {averageStock.toFixed(1)}</li>
      </ul>
    </section>
  )
}

export default StatisticsPanel
