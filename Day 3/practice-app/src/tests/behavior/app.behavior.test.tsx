import { fireEvent, render, screen } from '@testing-library/react'
import App from '../../App'

describe('App behavior', () => {
  it('filters cards by query and can reset filters', () => {
    render(<App />)

    const searchInput = screen.getByLabelText('Search by title, artist, album, or genre')
    fireEvent.change(searchInput, { target: { value: 'Bohemian' } })

    expect(screen.getByRole('heading', { level: 3, name: 'Bohemian Rhapsody' })).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 3, name: 'Bad Guy' })).toBeNull()

    fireEvent.change(searchInput, { target: { value: 'not-a-real-song' } })
    expect(screen.getByRole('heading', { level: 3, name: 'No cards match your filters' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(screen.getByRole('heading', { level: 3, name: 'Bad Guy' })).toBeTruthy()
  })

  it('adds, edits, and deletes a card', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Song title *'), { target: { value: 'Test Anthem' } })
    fireEvent.change(screen.getByLabelText('Artist *'), { target: { value: 'QA Artist' } })
    fireEvent.change(screen.getByLabelText('Genres'), { target: { value: 'Indie, Pop' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add music card' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Test Anthem' })).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit card' }).pop()!)
    fireEvent.change(screen.getByLabelText('Song title *'), { target: { value: 'Updated Anthem' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('heading', { level: 3, name: 'Updated Anthem' })).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete card' }).pop()!)
    expect(screen.queryByRole('heading', { level: 3, name: 'Updated Anthem' })).toBeNull()
  })
})
