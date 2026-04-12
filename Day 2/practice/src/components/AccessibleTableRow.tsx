import type { Movie } from "../types/movie";

type AccessibleTableRowProps = {
  row: Movie;
  onTitleClick: (movie: Movie) => void;
};

export default function AccessibleTableRow({ row, onTitleClick }: AccessibleTableRowProps) {
  return (
    <tr>
      <td>
        <button
          type="button"
          className="movie-title-dialog-trigger"
          aria-haspopup="dialog"
          aria-label={`Details for ${row.title}`}
          onClick={() => onTitleClick(row)}
        >
          {row.title}
        </button>
      </td>
      <td>{row.year}</td>
      <td>{row.genre.join(", ")}</td>
      <td>{row.director}</td>
      <td>{row.rating}</td>
      <td>{row.durationMin} minutes</td>
      <td>{row.isNetflixOriginal ? "Yes" : "No"}</td>
      <td>{row.watchedDate}</td>
      <td>
        <a href={row.link} target="_blank" rel="noopener noreferrer">
          IMDB
        </a>
      </td>
    </tr>
  );
}
