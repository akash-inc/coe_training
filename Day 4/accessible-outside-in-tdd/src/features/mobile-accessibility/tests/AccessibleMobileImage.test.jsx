import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibleMobileImage } from '../components/AccessibleMobileImage'

describe('AccessibleMobileImage', () => {
  const defaultProps = {
    src: '/sample-image.png',
    alt: 'Dashboard preview',
    caption: 'Mobile accessible image preview',
  }

  it('renders image semantics and zoom controls', () => {
    render(<AccessibleMobileImage {...defaultProps} />)

    expect(screen.getByText('Mobile accessible image preview')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Dashboard preview' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Image zoom controls' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zoom out image' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Zoom in image' })).toBeEnabled()
  })

  it('zooms image in and resets back to 100%', async () => {
    const user = userEvent.setup()
    render(<AccessibleMobileImage {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Zoom in image' }))

    const image = screen.getByRole('img', { name: 'Dashboard preview' })
    expect(image).toHaveStyle({ transform: 'scale(1.25)' })
    expect(screen.getByRole('status')).toHaveTextContent('Zoom 125%')

    await user.click(screen.getByRole('button', { name: 'Reset image zoom' }))
    expect(image).toHaveStyle({ transform: 'scale(1)' })
    expect(screen.getByRole('status')).toHaveTextContent('Zoom 100%')
  })

  it('caps zoom controls at min and max levels', async () => {
    const user = userEvent.setup()
    render(<AccessibleMobileImage {...defaultProps} />)

    const zoomInButton = screen.getByRole('button', { name: 'Zoom in image' })
    for (let i = 0; i < 8; i += 1) {
      await user.click(zoomInButton)
    }

    expect(zoomInButton).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Zoom 300%')
  })
})
