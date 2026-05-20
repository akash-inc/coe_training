# Tailwind CSS Layers: Why `text-red-600` Did Not Apply

## How `@layer` Works

CSS cascade layers (`@layer`) add a priority level before specificity. For normal
declarations, layer priority is evaluated before selector specificity.

In practice, priority is determined roughly by:

1. Importance and origin (`!important`, user-agent, user, author)
2. Layer priority
3. Specificity
4. Source order

## Tailwind's Layer Model

Tailwind organizes generated CSS into these layers:

- `@layer theme`
- `@layer base`
- `@layer components`
- `@layer utilities`

Utility classes like `text-red-600` are generated in `@layer utilities`.

## Why the Utility Was Not Applied

If a rule like this is written as unlayered CSS:

```css
h1 {
  color: var(--text-h);
}
```

it can override layered Tailwind utility rules like `.text-red-600`, even if the
utility class is present on the element.

## Fix

Move global element styles into Tailwind layers, for example:

```css
@layer base {
  h1,
  h2 {
    color: var(--text-h);
  }
}
```

Then utility classes in `@layer utilities` can override those defaults as intended.

## Rule of Thumb

- Put element defaults (`h1`, `p`, and so on) in `@layer base`
- Put reusable custom classes in `@layer components`
- Use utility classes in markup for local overrides
- Avoid unlayered CSS unless you intentionally want stronger global overrides
