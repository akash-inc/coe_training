import type { CSSProperties, ReactNode } from 'react'
import type { MusicCard } from './assets/data'
import './Card.css'

type CardProps = {
  // Accept a song object (from data.ts) or fallback to manual props for older usages/tests
  song?: MusicCard
  title?: string
  children?: ReactNode
  style?: CSSProperties
  className?: string
}

export default function Card({ song, title, children, style, className }: CardProps) {
  const cardTitle = song ? song.title : title
  const cardArtist = song?.artist
  const cardAlbum = song?.album
  const cardYear = song?.year
  const imageSrc = song?.image
  const genres = song?.genres
  const youtube = song?.link?.youtube
  const spotify = song?.link?.spotify

  return (
    <section className={['card', className].filter(Boolean).join(' ')} style={style}>
      {cardTitle && <h2 className="card-title">{cardTitle}</h2>}

      {song ? (
        <div className="card-content">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={`${cardTitle} cover art`}
              className="card-image"
              loading="lazy"
              decoding="async"
              style={{ width: 120, height: 120, borderRadius: 8, objectFit: 'cover' }}
            />
          )}
          <div className="card-details">
            {cardArtist && (
              <div>
                <strong>Artist:</strong> {cardArtist}
              </div>
            )}
            {cardAlbum && (
              <div>
                <strong>Album:</strong> {cardAlbum} {cardYear && `(${cardYear})`}
              </div>
            )}
            {genres && genres.length > 0 && (
              <div>
                <strong>Genres:</strong> {genres.join(', ')}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              {youtube && (
                <a
                  href={youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: 8 }}
                >
                  YouTube
                </a>
              )}
              {spotify && (
                <a
                  href={spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Spotify
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-content">{children}</div>
      )}
    </section>
  )
}
