import type { MusicCard } from '../types/music'
import './Card.css'

type CardProps = {
  card: MusicCard
  onEdit: (card: MusicCard) => void
  onDelete: (card: MusicCard) => void
}

export default function Card({ card, onDelete, onEdit }: CardProps) {
  const titleId = `card-title-${card.id}`

  return (
    <article className="card" aria-labelledby={titleId}>
      <div className="card-content">
        <img
          src={card.image}
          alt={`${card.title} cover art`}
          className="card-image"
          loading="lazy"
          decoding="async"
        />
        <div className="card-details">
          <h3 id={titleId} className="card-title">
            {card.title}
          </h3>
          <dl className="card-meta">
            <div>
              <dt>Artist</dt>
              <dd>{card.artist}</dd>
            </div>
            <div>
              <dt>Album</dt>
              <dd>
                {card.album} ({card.year})
              </dd>
            </div>
            <div>
              <dt>Genres</dt>
              <dd>{card.genres.join(', ')}</dd>
            </div>
          </dl>

          <div className="card-links">
            {card.link.youtube ? (
              <a
                href={card.link.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${card.title} on YouTube`}
              >
                YouTube
              </a>
            ) : null}

            {card.link.spotify ? (
              <a
                href={card.link.spotify}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${card.title} on Spotify`}
              >
                Spotify
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card-actions">
        <button type="button" className="button-secondary" onClick={() => onEdit(card)}>
          Edit card
        </button>
        <button type="button" className="button-danger" onClick={() => onDelete(card)}>
          Delete card
        </button>
      </div>
    </article>
  )
}
