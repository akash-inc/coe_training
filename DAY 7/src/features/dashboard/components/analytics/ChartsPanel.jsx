function ChartsPanel({ products }) {
  const electronics = products.filter((item) => item.category === 'Electronics').length
  const apparel = products.filter((item) => item.category === 'Apparel').length
  const home = products.filter((item) => item.category === 'Home').length

  return (
    <section className="panel dashboard-panel">
      <h4>Charts</h4>
      <p className="exercise-objective">Category distribution snapshot.</p>
      <ul>
        <li>Electronics: {electronics}</li>
        <li>Apparel: {apparel}</li>
        <li>Home: {home}</li>
      </ul>
    </section>
  )
}

export default ChartsPanel
