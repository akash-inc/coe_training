import Card from "../../Card";
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

describe('Card', () => {

  it('should have no accessibility violations', async () => {
    const { container } = render(<Card title="Hello World">
      <p>This is a card with a title and a paragraph</p>
    </Card>);
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
});