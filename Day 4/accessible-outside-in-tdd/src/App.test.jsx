import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the full accessibility lab experience', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'JobTrail accessibility lab' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Role search (combobox)' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Application wizard (multi-step form)' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Team QA checklist' })).toBeInTheDocument()
  })
})
