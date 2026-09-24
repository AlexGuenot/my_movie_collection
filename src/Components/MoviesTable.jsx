import './MoviesTable.css'
import { useEffect, useState } from 'react'
import { supabase } from '../createClient.js'

function MoviesTable({ searchText, movies, collectionView, onMoviesLoaded, onMovieDeleted, onMovieRestored }) {
  const [deletedMovie, setDeletedMovie] = useState(null)
  const [isUndoing, setIsUndoing] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const normalizedSearch = searchText.trim().toLowerCase();
  const moviesInView = movies.filter((movie) =>
    collectionView === 'cart' ? movie.is_owned === false : movie.is_owned !== false
  );
  const filteredMovies = moviesInView.filter((movie) => {
    return [movie.title, movie.director].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    );
  });

  useEffect(() => {
    fetchMovies()
  },[])

  useEffect(() => {
    if (!deletedMovie) {
      return undefined
    }

    const timeoutId = setTimeout(() => setIsDismissing(true), 4700)
    return () => clearTimeout(timeoutId)
  }, [deletedMovie])

  async function fetchMovies(){
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('id', { ascending: true })
    if (error) {
      console.error(error)
      return
    }
    onMoviesLoaded(data ?? [])
  }

  async function deleteMovie(movieId) {
    const { data, error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId)
      .select()

    if (error) {
      console.error(error)
      return
    }

    if (!data?.length) {
      console.error('No movie was deleted. Check the Supabase DELETE policy for the movies table.')
      return
    }

    onMovieDeleted(movieId)
    setIsDismissing(false)
    setDeletedMovie(data[0])
  }

  async function undoDelete() {
    if (!deletedMovie) {
      return
    }

    setIsUndoing(true)
    const { data, error } = await supabase
      .from('movies')
      .insert(deletedMovie)
      .select()
      .single()
    setIsUndoing(false)

    if (error) {
      console.error(error)
      return
    }

    onMovieRestored(data)
    setIsDismissing(true)
  }

  function handleToastAnimationEnd() {
    if (isDismissing) {
      setDeletedMovie(null)
      setIsDismissing(false)
    }
  }

  return (
    <>
        <div className="table-results">
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Movie Title</th>
                  <th>Director</th>
                  <th>Release</th>
                  <th>Action</th>
                </tr>
              </thead>
              {/* data mapping */}
              <tbody>
                {filteredMovies.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.director}</td>
                    <td>{item.release_year}</td>
                    <td>
                        <button className="btn btn-outlined btn-info">Details</button>
                        <button
                          className="btn btn-outlined btn-error"
                          onClick={() => deleteMovie(item.id)}
                        >
                          Delete
                        </button>
                    </td>
                  </tr>
                ))}
                {filteredMovies.length === 0 && (
                  <tr>
                    <td colSpan="4">No movies found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {deletedMovie && (
          <div
            className={`delete-toast ${isDismissing ? 'is-dismissing' : ''}`}
            role="status"
            onAnimationEnd={handleToastAnimationEnd}
          >
            <span>Movie deleted.</span>
            <button className="btn btn-sm btn-ghost" onClick={undoDelete} disabled={isUndoing}>
              {isUndoing ? 'Restoring...' : 'Undo'}
            </button>
          </div>
        )}
    </>
  )
}

export default MoviesTable
