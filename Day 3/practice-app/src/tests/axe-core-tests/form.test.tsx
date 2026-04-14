import * as axe from 'axe-core'
import { render } from '@testing-library/react'
import Form from '../../components/Form'

describe('Form', () => {
  const axeOptions = {
    rules: {
      'color-contrast': { enabled: false },
    },
  }

  it('should have no accessibility violations', async () => {
    const { container } = render(<Form/>);
    const results = await axe.run(container, axeOptions)
    expect(results.violations.length).toBe(0)
    expect(container.querySelector('label[for="song-title"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-artist"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-album"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-genre"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-year"]')).not.toBeNull()
  })
})