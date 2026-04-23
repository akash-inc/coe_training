import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { withAppEnvironment } from '../src/storybook/decorators'

const preview: Preview = {
  decorators: [withAppEnvironment],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
