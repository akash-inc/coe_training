# WCAG 2.1 AA

## WCAG QuickRef

[How to Meet WCAG (Quickref Reference)](https://www.w3.org/WAI/WCAG22/quickref/?versions=2.1&currentsidebar=%23col_customize)

---

## What WCAG is asking you to do

Think of WCAG as 4 big promises your product should keep:

1. **Perceivable** – people can see/hear/get the content.
2. **Operable** – people can use it with keyboard, touch, voice, etc.
3. **Understandable** – people can understand what’s happening.
4. **Robust** – assistive tech (screen readers, etc.) can interpret it reliably.

---

## 1) Perceivable — “Can users perceive the content?”

### Text alternatives (images/icons/media)

- Every meaningful image/icon/button needs a clear text equivalent.
- Decorative images should be hidden from screen readers.
- CAPTCHA needs alternatives (e.g., another modality).

**Simple check:** If image disappears, can user still get the meaning?

### Audio/video

- Prerecorded video needs captions.
- Video with important visual info needs audio description or transcript alternative.
- Live media needs live captions (at higher levels more requirements apply).

**Simple check:** Can deaf/blind users get the same information?

### Structure and adaptability

- Use proper headings, labels, lists, table markup.
- Don’t rely on visual position alone (“click the button on the right”).
- Content should work in portrait/landscape unless essential.
- Inputs should support autofill semantics where applicable.

**Simple check:** Is meaning preserved if CSS/layout changes?

### Distinguishable content (contrast, zoom, spacing)

- Don’t use color alone to convey meaning.
- Text contrast must be strong enough.
- Users should zoom/reflow without losing content/function.
- Text spacing overrides should not break layout.
- Hover/focus popups must be dismissible/manageable.
- Contrast (Minimum)Level AA, The visual presentation of text and images of text has a contrast ratio of at least 7:1
- **Large Text:** Large-scale text and images of large-scale text have a contrast ratio of at least 4:5:1;

**Simple check:** At 200% zoom, keyboard-only, can user still read/use everything?

---

## 2) Operable — “Can users operate the interface?”

### Keyboard accessibility

- Everything important must work by keyboard.
- No keyboard traps.
- Single-key shortcuts need safeguards.

**Simple check:** Can you complete flows with `Tab`, `Shift+Tab`, `Enter`, `Space`, arrows?

### Time limits / moving content

- If there’s a timeout, user should get warning/extension options (except strict exceptions).
- Auto-moving/blinking/updating content should be pausable or controllable.

**Simple check:** Does time pressure block users from completing tasks?

### Seizure/physical reaction safety

- Avoid flashing content that can trigger seizures.
- Motion triggered by interaction should be disableable (for sensitive users).

**Simple check:** Any flashy or intense motion? If yes, control it.

### Navigation and focus

- Provide skip links or bypass blocks.
- Pages need clear titles.
- Focus order must make sense.
- Link purpose should be clear.
- Focus indicator must be visible and not hidden behind sticky UI.
- Multiple ways to find pages (for larger sites).
- Headings and Labels
- Focus visible
- Location in pages
- Link should be identified from link text alone

**Simple check:** While tabbing, can user always tell where they are and get where they need to go?

### Pointer/touch/target size

- Complex gestures should have simple alternatives.
- Drag actions should have non-drag alternatives.
- Touch targets should be large enough (minimum size criteria in 2.2).
- Concurrent Input Mechanism

**Simple check:** Can users with limited precision still activate controls reliably?

---

## 3) Understandable — “Do users understand content and behavior?”

### Language and readability

- Set page language and language changes in parts.
- Explain unusual terms and abbreviations (higher levels).
- Keep reading complexity manageable (or provide easier alternative where required at AAA).

**Simple check:** Would a new user immediately understand wording and labels?

### Predictable behavior

- Don’t trigger unexpected changes on focus/input.
- Keep navigation and component identification consistent.
- Keep help locations consistent (new in 2.2).
- **Change on Request**
  - **Changes of context are initiated only by user request or a mechanism is available to turn off such changes.**

**Simple check:** Does the UI behave the same way across pages?

### Forms and error handling

- Clearly label fields and instructions.
- Tell users exactly what error happened and how to fix it.
- Prevent serious mistakes (confirm/review/undo for sensitive actions).
- Minimize redundant re-entry (new in 2.2).
- Authentication should not force memory/cognitive tests without alternatives (new in 2.2).

**Simple check:** If user makes a mistake, can they recover quickly without frustration?

---

## 4) Robust — “Will assistive tech read this correctly?”

### Name, role, value + status updates

- Custom controls must expose proper role/state/value.
- Status messages (success/error/progress) should be announced to assistive tech without forcing focus changes.
- Markup content should be well-structured: proper start/end tags, correct nesting, no duplicate attributes, and unique IDs (unless explicitly allowed).
- In modern HTML, browsers handle these issues consistently, so this criterion is effectively always satisfied and accessibility concerns are covered by other rules.

**Simple check:** Do screen readers get control purpose/state and live updates correctly?

---

## Fast practical checklist (most impact first)

- Add meaningful `alt` text; hide decorative images from AT.
- Ensure full keyboard support and visible focus.
- Meet color contrast and don’t use color alone for meaning.
- Add captions for prerecorded video; provide transcripts/alternatives as needed.
- Use semantic HTML for headings, forms, and landmarks.
- Make forms clear: labels, errors, suggestions, prevention for critical actions.
- Ensure zoom/reflow/text-spacing don’t break UI.
- Make touch targets big enough; avoid gesture-only interactions.
- Keep navigation/help/behavior consistent.
- Validate ARIA/custom components and status announcements.

---

