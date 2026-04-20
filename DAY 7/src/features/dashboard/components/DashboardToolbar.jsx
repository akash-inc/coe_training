function DashboardToolbar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortByChange,
  categories,
}) {
  return (
    <section className="panel dashboard-panel">
      <h3>Dashboard Filters</h3>
      <div className="toolbar-grid">
        <label>
          Search products
          <input
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Try typing quickly to see debounce"
          />
        </label>

        <label>
          Category
          <select value={selectedCategory} onChange={onCategoryChange}>
            <option value="All">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort by
          <select value={sortBy} onChange={onSortByChange}>
            <option value="name-asc">Name A-Z</option>
            <option value="price-asc">Price low-high</option>
            <option value="price-desc">Price high-low</option>
            <option value="stock-desc">Stock high-low</option>
          </select>
        </label>

        <label>
          Max price: ${maxPrice}
          <input
            type="range"
            min="25"
            max="2000"
            step="25"
            value={maxPrice}
            onChange={onMaxPriceChange}
          />
        </label>
      </div>
    </section>
  )
}

export default DashboardToolbar
