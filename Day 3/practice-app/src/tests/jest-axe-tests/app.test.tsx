import App from '../../App'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('App', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<App />)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
    expect(container.querySelector('main#main-content')).not.toBeNull()
    expect(container.querySelector('a.skip-link')).not.toBeNull()
  })
})