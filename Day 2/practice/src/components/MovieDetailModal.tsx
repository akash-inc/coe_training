import type { Movie } from "../types/movie";
import { useModalFocusTrap } from "../hooks/useModalFocusTrap";
import { useEffect, useRef } from "react";

type MovieDetailModalProps = {
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = movie !== null;

  useModalFocusTrap(dialogRef, isOpen);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (movie) {
      if (!el.open) {
        el.showModal();
      }
    } else {
      el.close();
    }
  }, [movie]);

  return (
    <dialog
      ref={dialogRef}
      className="movie-detail-modal"
      tabIndex={-1}
      aria-labelledby="movie-detail-title"
      onClose={onClose}
    >
      {movie ? (
        <>
          <h2 id="movie-detail-title">{movie.title}</h2>
          <div className="movie-detail-modal-body">
            <p>
              <strong>Cast: </strong>
              {movie.cast.length > 0 ? movie.cast.join(", ") : "N/A"}
            </p>
            <p>
              <strong>Trailer: </strong>
              {movie.trailerLink ? (
                <a href={movie.trailerLink} target="_blank" rel="noopener noreferrer">
                  Open trailer
                </a>
              ) : (
                "N/A"
              )}
            </p>
            <p>
              <strong>Bookmarkable: </strong>
              {movie.bookmarkable ? "Yes" : "No"}
            </p>
          </div>
          <div className="movie-detail-modal-actions">
            <button type="button" className="movie-detail-modal-close" onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
