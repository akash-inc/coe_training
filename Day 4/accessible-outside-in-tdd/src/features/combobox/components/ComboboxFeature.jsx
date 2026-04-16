export function ComboboxFeature() {
  return (
    <section>
      <label htmlFor="job-role-search">Search roles</label>
      <input
        id="job-role-search"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
      />
    </section>
  )
}
