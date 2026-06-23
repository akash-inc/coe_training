# Chakra UI — Components, Styling, and How It Works

A practical guide to using Chakra UI: how to drop in components, how to style
them, and the mental model that makes everything click.

---

## 1. What Chakra UI Is

Chakra UI is a React component library built on a **style props** system. Instead
of writing CSS in separate files, you pass styling directly to components as
props. It gives you:

- **Prebuilt, accessible components** (buttons, modals, forms, menus, etc.) that
  follow WAI-ARIA standards out of the box.
- **A style-props API** so you style with React props (`bg`, `p`, `fontSize`)
  instead of CSS classes.
- **A theme + design-token system** so spacing, colors, and typography stay
  consistent.
- **Built-in light/dark mode** and responsive helpers.

The core idea: *your markup and your styling live in the same place, expressed
through tokens from a shared theme.*

---

## 2. Installation & Setup

```bash
npm i @chakra-ui/react @emotion/react
```

Wrap your app once with the provider. Everything inside it gets the theme and
style system.

```jsx
// main.jsx
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import App from "./App";

export default function Root() {
  return (
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
}
```

> The `ChakraProvider` is non-negotiable — style props, theme tokens, and color
> mode all read from the context it provides.

---

## 3. Adding Components

You import a component and use it like any React component. The difference is
that styling and layout come in as props.

```jsx
import { Button, Box, Stack, Heading, Text } from "@chakra-ui/react";

function Card() {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} maxW="sm">
      <Stack gap={3}>
        <Heading size="md">Welcome</Heading>
        <Text color="gray.600">This card is built entirely with props.</Text>
        <Button colorPalette="teal">Get started</Button>
      </Stack>
    </Box>
  );
}
```

### Layout primitives you'll use constantly

| Component | Purpose |
|-----------|---------|
| `Box` | A `div` with style props — the universal building block. |
| `Flex` | A `Box` with `display: flex` baked in. |
| `Stack` / `HStack` / `VStack` | Evenly-spaced children (use `gap`). |
| `Grid` / `SimpleGrid` | CSS grid layouts. |
| `Container` | Centered, max-width content wrapper. |

The pattern is always the same: pick a component, pass props to shape it.

---

## 4. Styling With Style Props

This is the heart of Chakra. Almost every CSS property has a prop, often with a
short alias.

```jsx
<Box
  bg="blue.500"        // background-color
  color="white"        // color
  p={4}                // padding (theme spacing scale)
  px={6}               // padding-left + padding-right
  m={2}                // margin
  borderRadius="md"    // border-radius token
  fontSize="lg"        // font-size token
  fontWeight="bold"
  boxShadow="md"
  _hover={{ bg: "blue.600" }}   // pseudo-selector as a prop
>
  Styled box
</Box>
```

### Common prop aliases

| Prop | CSS |
|------|-----|
| `p`, `m` | padding, margin |
| `px`/`py`, `mx`/`my` | horizontal/vertical padding/margin |
| `bg` | background |
| `w`, `h` | width, height |
| `minW`, `maxW` | min/max width |
| `gap` | gap |
| `rounded` / `borderRadius` | border-radius |

### Pseudo-states and selectors

Underscore-prefixed props map to states and nested selectors:

```jsx
<Button
  _hover={{ bg: "purple.600" }}
  _active={{ transform: "scale(0.98)" }}
  _disabled={{ opacity: 0.4 }}
  _focusVisible={{ outline: "2px solid", outlineColor: "purple.300" }}
>
  Click
</Button>
```

You can also target children: `_dark`, `_first`, `_last`, `_groupHover`, etc.

---

## 5. Design Tokens — Why Values Look Like `blue.500` and `p={4}`

Chakra values aren't raw CSS — they're **tokens** pulled from the theme.

- **Colors** use a `name.shade` scale: `gray.50` → `gray.900`.
- **Spacing** uses a numeric scale where `1 = 0.25rem (4px)`. So `p={4}` = `1rem`.
- **Font sizes**: `sm`, `md`, `lg`, `xl`, `2xl`, …
- **Radii / shadows**: `sm`, `md`, `lg`, `full`.

Because every component reads from the same scale, spacing and color stay
consistent across the whole app without you memorizing pixel values.

---

## 6. Responsive Styling

Any style prop accepts an **array** or **object** keyed by breakpoint. Values
apply mobile-first (smallest first, then overrides as the screen grows).

```jsx
// Array syntax: [base, sm, md, lg, xl]
<Box w={["100%", "50%", "33%"]} />

// Object syntax (clearer)
<Box
  fontSize={{ base: "sm", md: "lg", lg: "xl" }}
  px={{ base: 4, md: 8 }}
/>
```

Default breakpoints: `base` (0), `sm` (480px), `md` (768px), `lg` (992px),
`xl` (1280px), `2xl` (1536px).

---

## 7. Color Mode (Light / Dark)

Chakra ships dark mode support. Use the `useColorMode` hook to read/toggle, and
`_dark` (or the `useColorModeValue` helper) to vary styles.

```jsx
import { useColorMode, useColorModeValue, Button, Box } from "@chakra-ui/react";

function Panel() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue("gray.100", "gray.800");

  return (
    <Box bg={bg} p={4}>
      <Button onClick={toggleColorMode}>
        {colorMode === "light" ? "🌙 Dark" : "☀️ Light"}
      </Button>
    </Box>
  );
}
```

---

## 8. Customizing the Theme

When you outgrow defaults, extend the theme to add brand colors, fonts, or
component defaults. New tokens become available everywhere as props.

```jsx
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          500: { value: "#3182ce" },
          600: { value: "#2b6cb0" },
        },
      },
      fonts: {
        heading: { value: "'Inter', sans-serif" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
// Then: <ChakraProvider value={system}>
```

Now `<Box bg="brand.500" />` works just like the built-in colors.

---

## 9. How It Naturally Works (The Mental Model)

Put together, the flow is:

1. **`ChakraProvider`** injects the theme (tokens + config) into React context.
2. **Components** are plain React components that accept **style props**.
3. **Style props** are resolved against the theme — `blue.500` becomes a real
   color, `p={4}` becomes `1rem`.
4. Under the hood, Chakra (via **Emotion**) generates real CSS classes at
   runtime and attaches them. You never write the CSS yourself.
5. **Responsive values** and **pseudo-state props** compile into media queries
   and `:hover`/`:focus` rules automatically.
6. **Accessibility** (focus rings, ARIA roles, keyboard handling) is built into
   the components, so you get it for free.

The payoff: you describe *what* you want in JSX with consistent tokens, and
Chakra handles *how* it becomes styled, responsive, accessible CSS.

---

## 10. Quick Reference Cheatsheet

```jsx
// Spacing:    p, m, px, py, gap         → theme scale (4 = 1rem)
// Color:      bg, color, borderColor    → token.shade (e.g. red.400)
// Size:       w, h, maxW, minH          → tokens or raw units
// Typography: fontSize, fontWeight, lineHeight
// Layout:     display, align(Items), justify(Content)
// States:     _hover, _focus, _active, _disabled, _dark
// Responsive: prop={{ base, md, lg }}   or  prop={[a, b, c]}
```

---

### Further Reading
- Official docs: https://chakra-ui.com
- Component list: https://chakra-ui.com/docs/components
- Theming: https://chakra-ui.com/docs/theming/overview
