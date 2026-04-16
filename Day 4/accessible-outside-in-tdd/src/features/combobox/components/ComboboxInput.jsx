export function ComboboxInput({
  inputId,
  label,
  value,
  isExpanded,
  controlsId,
  activeDescendantId,
  onChange,
  onKeyDown,
}) {
  return (
    <>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        value={value}
        aria-autocomplete="list"
        aria-expanded={isExpanded ? 'true' : 'false'}
        aria-controls={isExpanded ? controlsId : undefined}
        aria-activedescendant={activeDescendantId}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </>
  )
}
