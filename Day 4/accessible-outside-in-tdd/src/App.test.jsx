import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders app shell text', () => {
    render(<App />)

    expect(screen.getByText('app')).toBeInTheDocument()
  })
})
