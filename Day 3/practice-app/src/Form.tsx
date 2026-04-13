import { useState } from 'react'
import './Form.css'

export type MusicCardFormInput = {
  title: string
  artist: string
  album: string
  yearInput: string
  genreInput: string
}

type FormProps = {
  onAddCard?: (input: MusicCardFormInput) => void
}

export default function Form({ onAddCard = () => {} }: FormProps) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [genre, setGenre] = useState('')
  const [yearInput, setYearInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onAddCard({
      title: title.trim(),
      artist: artist.trim(),
      album: album.trim(),
      yearInput: yearInput.trim(),
      genreInput: genre.trim(),
    })

    setSubmitted(true)
  }

  function handleAddAnother() {
    setSubmitted(false)
    setTitle('')
    setArtist('')
    setAlbum('')
    setGenre('')
    setYearInput('')
  }

  if (submitted) {
    return (
      <div className="form-card">
        <p>Music card added successfully.</p>
        <p>It now appears in the list above this form.</p>
        <button className="form-submit" type="button" onClick={handleAddAnother}>
          Add Another
        </button>
      </div>
    )
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="song-title">Song Title:</label>
        <input
          id="song-title"
          name="title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter song title"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="song-artist">Artist:</label>
        <input
          id="song-artist"
          name="artist"
          type="text"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="Enter artist name"
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="song-album">Album:</label>
        <input
          id="song-album"
          name="album"
          type="text"
          value={album}
          onChange={e => setAlbum(e.target.value)}
          placeholder="Enter album name"
        />
      </div>
      <div className="form-field">
        <label htmlFor="song-year">Year:</label>
        <input
          id="song-year"
          name="year"
          type="number"
          min={1900}
          max={2100}
          value={yearInput}
          onChange={e => setYearInput(e.target.value)}
          placeholder={`e.g. ${new Date().getFullYear()} (optional)`}
        />
      </div>
      <div className="form-field">
        <label htmlFor="song-genre">Genre:</label>
        <input
          id="song-genre"
          name="genre"
          type="text"
          value={genre}
          onChange={e => setGenre(e.target.value)}
          placeholder="e.g. Pop or Pop, Rock"
        />
      </div>
      <button className="form-submit" type="submit">
        Submit
      </button>
    </form>
  )
}
