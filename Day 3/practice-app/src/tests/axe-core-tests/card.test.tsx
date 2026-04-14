import * as axe from 'axe-core'
import { render } from '@testing-library/react'
import Card from '../../components/Card'

describe('Card', () => {
  const axeOptions = {
    rules: {
      'color-contrast': { enabled: false },
    },
  }

  it('should have no accessibility violations', async () => {
    const { container } = render(<Card title="Hello World">
      <p>This is a card with a title and a paragraph</p>
    </Card>);
    const results = await axe.run(container, axeOptions)
    expect(results.violations.length).toBe(0)
  })
});