import { ComboboxInput } from './ComboboxInput'
import { ComboboxList } from './ComboboxList'

export function ComboboxFeature() {
  return (
    <section>
      <ComboboxInput
        inputId="job-role-search"
        label="Search roles"
        value=""
        isExpanded={false}
        controlsId="job-role-list"
        activeDescendantId={undefined}
        onChange={() => {}}
        onKeyDown={() => {}}
      />
      <ComboboxList
        listboxId="job-role-list"
        optionIdPrefix="job-role-option"
        options={[]}
        activeIndex={-1}
      />
    </section>
  )
}
