# Summary: ARIA live regions

**Source:** [ARIA live regions — MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)

## What they are for

When JavaScript updates the page without a full reload (search results, alerts, notifications), sighted users see the change, but assistive technology users may not. **Live regions** expose those dynamic updates so screen readers can announce them.

## When attributes must be in place

Assistive technologies usually announce **changes to content inside** a live region, not the mere presence of the region. Add `aria-live` or a live-region `role` (for example `status`) **before** the content changes—either in initial HTML or via script. Typical pattern: start with an **empty** live region, then update its contents in a separate step.

**Exception:** `role="alert"` is often handled specially: content is commonly announced even when the alert region is in the initial markup or injected with the message already inside. Implementations may prefix announcements with “Alert.” Use sparingly because it is disruptive.

## `aria-live`

This attribute sets how urgently updates should be presented:

| Value | Use |
| --- | --- |
| **`polite`** | Default choice for important but non-urgent updates. The screen reader speaks changes when the user is idle. |
| **`assertive`** | Only for time-critical information that must interrupt immediately. Interrupts current speech and is easy to abuse—use rarely. |
| **`off`** | Does **not** mean “never announce.” Changes are generally announced only when focus is on or inside the element (or for roles that imply this, such as `marquee` or `timer`). |

Example pattern: a control updates a `role="region"` with `aria-live="polite"`; with `polite`, rapid interaction may not announce every intermediate step—announcements align better with a natural pause (e.g. final selection).

## Roles that imply live regions

These roles behave as live regions by default (redundant `aria-live` is sometimes recommended for compatibility):

| Role | Typical use |
| --- | --- |
| `log` | Chat, error, game logs — often pair with `aria-live="polite"` for compatibility. |
| `status` | Status messages — often pair with `aria-live="polite"`. |
| `alert` | Errors, validation — some add `aria-live="assertive"` for compatibility; **caution:** combining both can cause double announcements in VoiceOver on iOS. |
| `progressbar` | Progress; use with `aria-valuemin`, `aria-valuenow`, `aria-valuemax`. |
| `marquee` | Scrolling text (e.g. ticker). |
| `timer` | Countdowns, clocks. |

## Other live region attributes

- **`aria-atomic`** (`true` | `false`, default `false`): If `true`, the whole region is read on each update, not only the changed nodes. Useful when partial updates would sound meaningless (e.g. a clock where only minutes change—you want “17:34” not just “34”).
- **`aria-relevant`**: Which DOM changes matter. Space-separated list: `additions`, `removals`, `text`, `all`. Default is `additions text`. Example: a live roster list can use `aria-relevant="additions removals"` so both joins and leaves are announced.

Live regions are widely supported; older research (e.g. Vispero, Paul J. Adam) documents nuances in `aria-atomic` and `aria-relevant` behavior across tools.

## Practical takeaway

Use **`aria-live="polite"`** (or `role="status"` / `log` with redundant `polite` where needed) for most dynamic, non-interactive updates. Reserve **`assertive`** / **`alert`** for true interruptions. Tune **`aria-atomic`** and **`aria-relevant`** when the default “only what changed” behavior is confusing or incomplete.
