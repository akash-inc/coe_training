import AddMovieForm from "./components/AddMovieForm";
import MovieTableSection from "./components/MovieTableSection";
import "./App.css";
import { useMoviesStore } from "./hooks/useMoviesStore";

export default function App() {
  const { allMovies, addMovie } = useMoviesStore();

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-kicker">Day 2 Practice</p>
        <h1>Netflix Movies</h1>
        <p className="app-subtitle">
          Add movies, apply filters, and review accessible table interactions.
        </p>
      </header>
      <section className="app-panel" aria-label="Add a movie">
        <AddMovieForm onAddMovie={addMovie} />
      </section>
      <section className="app-panel" aria-label="Browse movie table">
        <MovieTableSection movies={allMovies} />
      </section>
    </main>
  );
}
