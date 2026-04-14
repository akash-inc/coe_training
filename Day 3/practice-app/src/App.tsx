import { useState } from 'react'
import type { MusicCard } from './assets/data'
import { defaultNewCardCoverImage, musicCards } from './assets/data'
import Card from './components/Card'
import Form, { type MusicCardFormInput } from './components/Form'

export default function App() {
  const [cards, setCards] = useState<MusicCard[]>(musicCards)

  function buildMusicCardFromFormInput(input: MusicCardFormInput, nextId: number): MusicCard {
    const genres = input.genreInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const parsedYear = input.yearInput === '' ? NaN : Number.parseInt(input.yearInput, 10)
    const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear()

    return {
      id: nextId,
      title: input.title,
      artist: input.artist,
      album: input.album || 'Unknown',
      year,
      genres: genres.length > 0 ? genres : ['Unspecified'],
      link: {},
      image: defaultNewCardCoverImage,
    }
  }

  function handleAddCard(input: MusicCardFormInput) {
    setCards(prev => {
      const nextId = prev.reduce((max, c) => Math.max(max, c.id), 0) + 1
      const nextCard = buildMusicCardFromFormInput(input, nextId)
      return [...prev, nextCard]
    })
  }

  return (
    <div className="app">
        {cards.map(song => (
          <Card key={song.id} song={song} />
        ))}
        <Form onAddCard={handleAddCard} />
      </div>
    )
}
