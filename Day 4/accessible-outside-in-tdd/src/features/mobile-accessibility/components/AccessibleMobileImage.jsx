import { useState } from 'react'
import './AccessibleMobileImage.css'

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))))
}

export function AccessibleMobileImage({ src, alt, caption }) {
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const zoomPercent = Math.round(zoom * 100)

  const handleZoomIn = () => {
    setZoom((currentZoom) => clampZoom(currentZoom + ZOOM_STEP))
  }

  const handleZoomOut = () => {
    setZoom((currentZoom) => clampZoom(currentZoom - ZOOM_STEP))
  }

  const handleResetZoom = () => {
    setZoom(MIN_ZOOM)
  }

  return (
    <figure className="accessible-mobile-image">
      <div className="accessible-mobile-image__header">
        <figcaption className="accessible-mobile-image__caption">{caption}</figcaption>
        <div className="accessible-mobile-image__status" role="status" aria-live="polite">
          Zoom {zoomPercent}%
        </div>
      </div>
      <p className="accessible-mobile-image__hint">
        Large touch targets support zoom controls. Pan the image area with one finger.
      </p>

      <div
        className="accessible-mobile-image__toolbar"
        role="group"
        aria-label="Image zoom controls"
      >
        <button
          className="accessible-mobile-image__button"
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out image"
        >
          Zoom out
        </button>
        <button
          className="accessible-mobile-image__button"
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in image"
        >
          Zoom in
        </button>
        <button
          className="accessible-mobile-image__button accessible-mobile-image__button--secondary"
          type="button"
          onClick={handleResetZoom}
          disabled={zoom === MIN_ZOOM}
          aria-label="Reset image zoom"
        >
          Reset
        </button>
      </div>

      <div className="accessible-mobile-image__frame">
        <img src={src} alt={alt} style={{ transform: `scale(${zoom})` }} />
      </div>
    </figure>
  )
}
