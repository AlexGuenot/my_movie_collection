import './App.css'
import { useState } from 'react'
import TopSection from './Components/TopSection.jsx'
import MoviesTable from './Components/MoviesTable.jsx'
function App() {
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  const [collectionView, setCollectionView] = useState('owned');
  
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

  function handleMovieRestored(movie) {
    setMovies((currentMovies) => [...currentMovies, movie])
  }

  function handleMovieUpdated(updatedMovie) {
    setMovies((currentMovies) => currentMovies.map((movie) =>
      movie.id === updatedMovie.id ? updatedMovie : movie
    ))
  }

  return (
  <div className="main-container">
      <div className="menu-container">
        <TopSection
          searchText={searchText}
          onSearchChange={setSearchText}
          collectionView={collectionView}
          onCollectionViewChange={setCollectionView}
          onMovieAdded={(movie) => setMovies((currentMovies) => [...currentMovies, movie])}
        />
        <MoviesTable
          searchText={searchText}
          movies={movies}
          collectionView={collectionView}
          onMoviesLoaded={handleMoviesLoaded}
          onMovieDeleted={handleMovieDeleted}
          onMovieRestored={handleMovieRestored}
          onMovieUpdated={handleMovieUpdated}
        />
      </div>
  </div>
  )
}
export default App
