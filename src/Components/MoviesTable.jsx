import './MoviesTable.css'
import {useState,useEffect} from 'react'
import { supabase } from '../createClient.js'

function MoviesTable({ searchText }) {
  const normalizedSearch = searchText.trim().toLowerCase();
  const [movies,setMovies] = useState([])
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
    setMovies(data ?? [])
  }
  return (
        <div className="table-results">
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Movie Title</th>
                  <th>Director</th>
                  <th>Action</th>
                </tr>
              </thead>
              {/* data mapping */}
              <tbody>
                {filteredMovies.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.title}</td>
                    <td>{item.director}</td>
                    <td>
                        <button className="btn btn-outlined btn-warning">Edit</button>
                        <button className="btn btn-outlined btn-error">Delete</button>
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
