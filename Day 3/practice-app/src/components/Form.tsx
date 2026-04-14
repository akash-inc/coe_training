import { useState } from 'react'
import type { MusicCard, MusicCardFormValues } from '../types/music'
import './Form.css'

type FormErrors = Partial<Record<keyof MusicCardFormValues, string>>

function toFormValues(card: MusicCard | null): MusicCardFormValues {
  if (!card) {
    return {
      title: '',
      artist: '',
      album: '',
      year: '',
      genres: '',
      youtube: '',
      spotify: '',
      image: '',
    }
  }

  return {
    title: card.title,
    artist: card.artist,
    album: card.album,
    year: String(card.year),
    genres: card.genres.join(', '),
    youtube: card.link.youtube ?? '',
    spotify: card.link.spotify ?? '',
    image: card.image,
  }
}

type FormProps = {
  editingCard: MusicCard | null
  onSaveCard: (input: MusicCardFormValues) => void
  onCancelEdit: () => void
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validate(values: MusicCardFormValues): FormErrors {
  const errors: FormErrors = {}

  if (values.title.trim() === '') {
    errors.title = 'Song title is required.'
  }

  if (values.artist.trim() === '') {
    errors.artist = 'Artist is required.'
  }

  if (values.year.trim() !== '') {
    const parsedYear = Number.parseInt(values.year, 10)
    const validYear = Number.isFinite(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100
    if (!validYear) {
      errors.year = 'Year must be between 1900 and 2100.'
    }
  }

  if (values.youtube.trim() !== '' && !isHttpUrl(values.youtube.trim())) {
    errors.youtube = 'YouTube link must be a valid URL.'
  }

  if (values.spotify.trim() !== '' && !isHttpUrl(values.spotify.trim())) {
    errors.spotify = 'Spotify link must be a valid URL.'
  }

  if (values.image.trim() !== '' && !isHttpUrl(values.image.trim())) {
    errors.image = 'Cover image must be a valid URL.'
  }

  return errors
}

export default function Form({ editingCard, onSaveCard, onCancelEdit }: FormProps) {
  const [values, setValues] = useState<MusicCardFormValues>(() => toFormValues(editingCard))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitMessage, setSubmitMessage] = useState('')
  const isEditing = editingCard !== null

  function updateField<K extends keyof MusicCardFormValues>(field: K, value: MusicCardFormValues[K]) {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setSubmitMessage('Please fix the highlighted fields.')
      return
    }

    onSaveCard(values)
    setSubmitMessage(isEditing ? 'Card updated.' : 'Card added.')
    if (!isEditing) {
      setValues(toFormValues(null))
    }
  }

  function getFieldErrorId(field: keyof MusicCardFormValues): string | undefined {
    return errors[field] ? `${field}-error` : undefined
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <p className="form-helper" id="form-helper">
        Fields with * are required. Genres can be comma-separated.
      </p>

      <div className="form-field">
        <label htmlFor="song-title">Song title *</label>
        <input
          id="song-title"
          name="title"
          type="text"
          value={values.title}
          onChange={event => updateField('title', event.target.value)}
          placeholder="Enter song title"
          required
          aria-invalid={Boolean(errors.title)}
          aria-describedby={getFieldErrorId('title')}
        />
        {errors.title ? (
          <p className="field-error" id="title-error">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="song-artist">Artist *</label>
        <input
          id="song-artist"
          name="artist"
          type="text"
          value={values.artist}
          onChange={event => updateField('artist', event.target.value)}
          placeholder="Enter artist name"
          required
          aria-invalid={Boolean(errors.artist)}
          aria-describedby={getFieldErrorId('artist')}
        />
        {errors.artist ? (
          <p className="field-error" id="artist-error">
            {errors.artist}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="song-album">Album</label>
        <input
          id="song-album"
          name="album"
          type="text"
          value={values.album}
          onChange={event => updateField('album', event.target.value)}
          placeholder="Enter album name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="song-year">Year</label>
        <input
          id="song-year"
          name="year"
          type="number"
          min={1900}
          max={2100}
          value={values.year}
          onChange={event => updateField('year', event.target.value)}
          placeholder={`e.g. ${new Date().getFullYear()} (optional)`}
          aria-invalid={Boolean(errors.year)}
          aria-describedby={getFieldErrorId('year')}
        />
        {errors.year ? (
          <p className="field-error" id="year-error">
            {errors.year}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="song-genre">Genres</label>
        <input
          id="song-genre"
          name="genre"
          type="text"
          value={values.genres}
          onChange={event => updateField('genres', event.target.value)}
          placeholder="e.g. Pop or Pop, Rock"
        />
      </div>

      <div className="form-field">
        <label htmlFor="song-youtube">YouTube link</label>
        <input
          id="song-youtube"
          name="youtube"
          type="url"
          value={values.youtube}
          onChange={event => updateField('youtube', event.target.value)}
          placeholder="https://www.youtube.com/..."
          aria-invalid={Boolean(errors.youtube)}
          aria-describedby={getFieldErrorId('youtube')}
        />
        {errors.youtube ? (
          <p className="field-error" id="youtube-error">
            {errors.youtube}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="song-spotify">Spotify link</label>
        <input
          id="song-spotify"
          name="spotify"
          type="url"
          value={values.spotify}
          onChange={event => updateField('spotify', event.target.value)}
          placeholder="https://open.spotify.com/..."
          aria-invalid={Boolean(errors.spotify)}
          aria-describedby={getFieldErrorId('spotify')}
        />
        {errors.spotify ? (
          <p className="field-error" id="spotify-error">
            {errors.spotify}
          </p>
        ) : null}
      </div>

      <div className="form-field">
        <label htmlFor="song-image">Cover image URL</label>
        <input
          id="song-image"
          name="image"
          type="url"
          value={values.image}
          onChange={event => updateField('image', event.target.value)}
          placeholder="https://images.example.com/cover.jpg"
          aria-invalid={Boolean(errors.image)}
          aria-describedby={getFieldErrorId('image')}
        />
        {errors.image ? (
          <p className="field-error" id="image-error">
            {errors.image}
          </p>
        ) : null}
      </div>

      <div className="form-actions">
        <button className="button-primary" type="submit">
          {isEditing ? 'Save changes' : 'Add music card'}
        </button>
        {isEditing ? (
          <button className="button-secondary" type="button" onClick={onCancelEdit}>
            Cancel edit
          </button>
        ) : null}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {submitMessage}
      </p>
    </form>
  )
}
