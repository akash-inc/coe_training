import { useMemo, useRef, useState } from 'react'
import { defaultCoverImage, musicSeed } from './assets/musicSeed'
import Card from './components/Card'
import EmptyState from './components/EmptyState'
import FilterPanel from './components/FilterPanel'
import Form from './components/Form'
import LiveRegion from './components/LiveRegion'
import ResultsSummary from './components/ResultsSummary'
import type { MusicCard, MusicCardFormValues } from './types/music'

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

function toGenreList(value: string): string[] {
  const genres = value
    .split(',')
    .map(genre => genre.trim())
    .filter(Boolean)

  return genres.length > 0 ? genres : ['Unspecified']
}

function toYear(value: string): number {
  const parsedYear = value === '' ? NaN : Number.parseInt(value, 10)
  return Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear()
}

function toSafeUrl(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export default function App() {
  const [cards, setCards] = useState<MusicCard[]>(musicSeed)
  const [query, setQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [editingCardId, setEditingCardId] = useState<number | null>(null)
  const [liveMessage, setLiveMessage] = useState('Accessibility showcase loaded.')
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)
  const formHeadingRef = useRef<HTMLHeadingElement>(null)

  const editingCard = useMemo(
    () => cards.find(card => card.id === editingCardId) ?? null,
    [cards, editingCardId],
  )

  const genreOptions = useMemo(() => {
    const allGenres = new Set<string>()
    for (const card of cards) {
      for (const genre of card.genres) {
        allGenres.add(genre)
      }
    }

    return Array.from(allGenres).sort((a, b) => a.localeCompare(b))
  }, [cards])

  const filteredCards = useMemo(() => {
    const normalizedQuery = normalizeText(query)
    return cards.filter(card => {
      const matchesGenre =
        selectedGenre === 'all' || card.genres.some(genre => genre.toLowerCase() === selectedGenre)

      if (!matchesGenre) {
        return false
      }

      if (normalizedQuery === '') {
        return true
      }

      const searchable = `${card.title} ${card.artist} ${card.album} ${card.genres.join(' ')}`
      return searchable.toLowerCase().includes(normalizedQuery)
    })
  }, [cards, query, selectedGenre])

  function focusResultsHeading() {
    requestAnimationFrame(() => resultsHeadingRef.current?.focus())
  }

  function focusFormHeading() {
    requestAnimationFrame(() => formHeadingRef.current?.focus())
  }

  function saveCard(values: MusicCardFormValues) {
    const album = values.album.trim() === '' ? 'Unknown' : values.album.trim()
    const nextCardData = {
      title: values.title.trim(),
      artist: values.artist.trim(),
      album,
      year: toYear(values.year.trim()),
      genres: toGenreList(values.genres),
      image: values.image.trim() === '' ? defaultCoverImage : values.image.trim(),
      link: {
        youtube: toSafeUrl(values.youtube),
        spotify: toSafeUrl(values.spotify),
      },
    }

    if (editingCard) {
      setCards(prev =>
        prev.map(card => (card.id === editingCard.id ? { ...card, ...nextCardData } : card)),
      )
      setEditingCardId(null)
      setLiveMessage(`Updated ${nextCardData.title}.`)
      focusResultsHeading()
      return
    }

    setCards(prev => {
      const nextId = prev.reduce((maxId, card) => Math.max(maxId, card.id), 0) + 1
      return [...prev, { ...nextCardData, id: nextId }]
    })
    setLiveMessage(`Added ${nextCardData.title}.`)
    focusResultsHeading()
  }

  function handleDeleteCard(card: MusicCard) {
    setCards(prev => prev.filter(item => item.id !== card.id))
    if (editingCardId === card.id) {
      setEditingCardId(null)
    }
    setLiveMessage(`Deleted ${card.title}.`)
    focusResultsHeading()
  }

  function handleStartEdit(card: MusicCard) {
    setEditingCardId(card.id)
    setLiveMessage(`Editing ${card.title}.`)
    focusFormHeading()
  }

  function handleCancelEdit() {
    setEditingCardId(null)
    setLiveMessage('Edit cancelled.')
    focusResultsHeading()
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery)
    setLiveMessage('Search filters updated.')
  }

  function handleGenreChange(nextGenre: string) {
    setSelectedGenre(nextGenre)
    setLiveMessage('Genre filter updated.')
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="app-shell">
        <header className="app-header">
          <p className="eyebrow">Day 3 Practice App</p>
          <h1>Accessibility Showcase: Music Library</h1>
          <p className="app-intro">
            Explore keyboard-first interactions, semantic structure, and robust feedback patterns.
          </p>
        </header>

        <main id="main-content" className="app-main">
          <section className="panel" aria-labelledby="filter-heading">
            <h2 id="filter-heading">Search and filter music</h2>
            <FilterPanel
              query={query}
              selectedGenre={selectedGenre}
              genres={genreOptions}
              onQueryChange={handleQueryChange}
              onGenreChange={handleGenreChange}
            />
          </section>

          <section className="panel" aria-labelledby="results-heading">
            <h2 id="results-heading" tabIndex={-1} ref={resultsHeadingRef}>
              Results
            </h2>
            <ResultsSummary
              total={cards.length}
              filtered={filteredCards.length}
              query={query}
              selectedGenre={selectedGenre}
            />

            {filteredCards.length === 0 ? (
              <EmptyState onResetFilters={() => {
                setQuery('')
                setSelectedGenre('all')
                setLiveMessage('Filters reset.')
              }} />
            ) : (
              <ul className="card-list" aria-label="Music cards">
                {filteredCards.map(card => (
                  <li key={card.id} className="card-list-item">
                    <Card card={card} onDelete={handleDeleteCard} onEdit={handleStartEdit} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="form-heading">
            <h2 id="form-heading" tabIndex={-1} ref={formHeadingRef}>
              {editingCard ? `Edit ${editingCard.title}` : 'Add a new music card'}
            </h2>
            <Form
              key={editingCard?.id ?? 'new-card'}
              editingCard={editingCard}
              onCancelEdit={handleCancelEdit}
              onSaveCard={saveCard}
            />
          </section>
        </main>

        <footer className="app-footer">
          <p>Tip: use the Tab key to navigate all controls and actions.</p>
        </footer>
      </div>
      <LiveRegion message={liveMessage} />
    </>
  )
}
