export function ComboboxList({ listboxId, optionIdPrefix, options, activeIndex }) {
  if (options.length === 0) {
    return null
  }

  return (
    <ul className="combobox-feature__list" id={listboxId} role="listbox">
      {options.map((option, index) => {
        const optionId = `${optionIdPrefix}-${index}`
        const isActive = index === activeIndex

        return (
          <li
            className="combobox-feature__option"
            id={optionId}
            key={option}
            role="option"
            aria-selected={isActive ? 'true' : 'false'}
          >
            {option}
          </li>
        )
      })}
    </ul>
  )
}
