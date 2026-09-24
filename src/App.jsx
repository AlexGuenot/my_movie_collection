import './App.css'
import { useState } from 'react'
import TopSection from './Components/TopSection.jsx'
import MoviesTable from './Components/MoviesTable.jsx'
function App() {
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  
  function handleMoviesLoaded(loadedMovies) {
    setMovies((currentMovies) => {
      const loadedIds = new Set(loadedMovies.map((movie) => movie.id))
      const pendingMovies = currentMovies.filter((movie) => !loadedIds.has(movie.id))
      return [...loadedMovies, ...pendingMovies]
    })
  }

  function handleMovieDeleted(movieId) {
    setMovies((currentMovies) => currentMovies.filter((movie) => movie.id !== movieId))
  }

  return (
  <div className="main-container">
      <div className="menu-container">
        <TopSection searchText={searchText} onSearchChange={setSearchText} onMovieAdded={(movie) => setMovies((currentMovies) => [...currentMovies, movie])} />
        <MoviesTable
          searchText={searchText}
          movies={movies}
          onMoviesLoaded={handleMoviesLoaded}
          onMovieDeleted={handleMovieDeleted}
        />
      </div>
  </div>
  )
}
export default App
