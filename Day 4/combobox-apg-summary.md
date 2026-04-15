# ARIA APG Combobox Pattern - Notes

This document summarizes the ARIA Authoring Practices Guide (APG) combobox pattern and includes a simple example.

## What a Combobox Is

A combobox is an input widget with an associated popup that helps users choose a value.
The popup can be a:

- `listbox`
- `grid`
- `tree`
- `dialog`

Two common forms:

- **Select-only combobox**: no text entry, user must choose from popup.
- **Editable combobox**: user can type, with optional filtering/suggestions.

## Why Use It

Use a combobox when:

- The value should come from known options (for example, location names), or
- Free text is allowed but suggestions improve speed/usability (for example, search terms).

## Autocomplete Modes

- `none`: suggestions do not change based on typed input.
- `list`: suggestions match typed input (manual selection).
- `list` with automatic selection: first suggestion is auto-highlighted.
- `both`: list autocomplete + inline completion text in the input.

## Keyboard Interaction (Core)

When focus is in the combobox:

- `Tab`: moves to/from combobox in normal tab order.
- `Down Arrow`: opens popup and moves to popup options.
- `Escape`: closes popup (optionally clears input if implemented that way).
- `Enter`: accepts highlighted suggestion.
- Printable keys: type into editable combobox.

Popup navigation then depends on popup type (`listbox`, `grid`, `tree`, or `dialog`).

## Required ARIA Semantics

Combobox element should include:

- `role="combobox"`
- `aria-expanded="false|true"`
- `aria-controls="popup-id"`
- `aria-autocomplete="none|list|both"` (for editable variants)
- Accessible label via `<label>`, `aria-labelledby`, or `aria-label`

Popup element:

- `role="listbox"` (or `grid`, `tree`, `dialog`)
- If popup role is not listbox, set `aria-haspopup` accordingly (`grid`, `tree`, or `dialog`)

Active option handling:

- Keep DOM focus on input in listbox/grid/tree patterns
- Use `aria-activedescendant` on combobox to indicate focused popup item
- Use `aria-selected="true"` on current selected suggestion

## Important Implementation Notes

- No ARIA is better than bad ARIA.
- Do not break native text editing keys for inputs.
- `dialog` popup differs: real DOM focus moves into dialog.

---

## Simple Example (Editable Combobox with List Popup)

This example shows a minimal editable combobox using a `listbox` popup.

```html
<label for="city-input">City</label>
<input
  id="city-input"
  type="text"
  role="combobox"
  aria-autocomplete="list"
  aria-expanded="true"
  aria-controls="city-list"
  aria-activedescendant="city-option-0"
/>

<ul id="city-list" role="listbox">
  <li id="city-option-0" role="option" aria-selected="true">London</li>
  <li id="city-option-1" role="option">Lisbon</li>
  <li id="city-option-2" role="option">Lagos</li>
</ul>
```

### How This Example Maps to APG

- Input acts as the combobox (`role="combobox"`).
- Popup is controlled with `aria-controls` and visibility state with `aria-expanded`.
- Current active suggestion is announced with `aria-activedescendant`.
- Selected option is marked with `aria-selected="true"`.

