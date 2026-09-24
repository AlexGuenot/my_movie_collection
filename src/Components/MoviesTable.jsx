import './MoviesTable.css'
import { useEffect } from 'react'
import { supabase } from '../createClient.js'

function MoviesTable({ searchText, movies, onMoviesLoaded, onMovieDeleted }) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredMovies = movies.filter((movie) => {
    return [movie.title, movie.director].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    );
  });

  useEffect(() => {
    fetchMovies()
  },[])

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
      .select('id')

    if (error) {
      console.error(error)
      return
    }

    if (!data?.length) {
      console.error('No movie was deleted. Check the Supabase DELETE policy for the movies table.')
      return
    }

    onMovieDeleted(movieId)
  }

  return (
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
  )
}

export default MoviesTable
