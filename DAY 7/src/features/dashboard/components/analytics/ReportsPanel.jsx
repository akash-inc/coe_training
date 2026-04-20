function ReportsPanel({ products }) {
  const lowStockCount = products.filter((item) => item.stock < 20).length
  const highValueCount = products.filter((item) => item.basePrice > 1000).length

  return (
    <section className="panel dashboard-panel">
      <h4>Reports</h4>
      <p className="exercise-objective">Generated report summaries.</p>
      <ul>
        <li>Low stock products: {lowStockCount}</li>
        <li>High value products: {highValueCount}</li>
      </ul>
    </section>
  )
}

export default ReportsPanel
