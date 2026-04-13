import Form from "../../Form";
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

describe('Form', () => {  

  it('should have no accessibility violations', async () => {
    const { container } = render(<Form />);
    const results = await axe(container)

    expect(results).toHaveNoViolations()
    expect(container.querySelector('label[for="song-title"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-artist"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-album"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-genre"]')).not.toBeNull()
    expect(container.querySelector('label[for="song-year"]')).not.toBeNull()
  })
});