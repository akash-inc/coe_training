import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

export const decorators = [
  (Story) => (
    <ChakraProvider value={defaultSystem}>
      <Story />
    </ChakraProvider>
  ),
]

export const parameters = {
  a11y: {
    config: {},
    options: { runOnly: ["wcag2a", "wcag2aa"] },
    test: "todo"
  }
}

export const globalTypes = {
  colorMode: {
    description: "Chakra color mode",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: ["light", "dark"],
    },
  },
};

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
};

export default preview;