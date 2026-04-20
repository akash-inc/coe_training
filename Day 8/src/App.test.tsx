import { render, screen } from '@testing-library/react'
import App from './App'

describe('Kanban board end-state contract', () => {
  it('renders a drag-and-drop board with four workflow columns', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /zustand kanban board/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('region', { name: /to do column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /in progress column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /review column/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /done column/i })).toBeInTheDocument()
  })
})
