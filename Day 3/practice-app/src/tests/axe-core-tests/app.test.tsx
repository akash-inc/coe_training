import * as axe from 'axe-core'
import { render } from '@testing-library/react'
import App from '../../App'

describe('App', () => {
  const axeOptions = {
    rules: {
      'color-contrast': { enabled: false },
    },
  }

  it('should have no accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations.length).toBe(0)
    expect(container.querySelector('main#main-content')).not.toBeNull()
  })
})