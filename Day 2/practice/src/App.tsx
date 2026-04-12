import AddMovieForm from "./components/AddMovieForm";
import MovieTableSection from "./components/MovieTableSection";
import "./App.css";
import useMoviesStore from "./hooks/useMoviesStore";

export default function App() {
  const { allMovies, addMovie } = useMoviesStore();

  return (
    <main>
      <h1>Netflix Movies</h1>
      <AddMovieForm onAddMovie={addMovie} />
      <MovieTableSection movies={allMovies} />
    </main>
  );
}
