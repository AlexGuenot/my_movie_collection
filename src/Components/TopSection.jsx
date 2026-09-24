import './TopSection.css'
import { useState } from 'react'
import { supabase } from '../createClient.js'

function TopSection({ searchText, onSearchChange, collectionView, onCollectionViewChange, onMovieAdded }) {
  const [movie, setMovie] = useState({ title: '', director: '', releaseYear: '' })
  const [movieCollection, setMovieCollection] = useState('owned')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(event) {
    setMovie({ ...movie, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('movies')
      .insert({
        title: movie.title,
        director: movie.director,
        release_year: Number(movie.releaseYear),
        is_owned: movieCollection === 'owned',
      })
      .select()
      .single()

    setIsSaving(false)

    if (error) {
      console.error(error)
      setErrorMessage('Could not add this movie.')
      return
    }

    onMovieAdded(data)
    setMovie({ title: '', director: '', releaseYear: '' })
    document.getElementById('my_modal_3').close()
  }

  function openAddMovieModal() {
    setMovieCollection(collectionView)
    document.getElementById('my_modal_3').showModal()
  }

  return (
    <>
    <div className="top-search">
      <div className="action-top">
          <label className="input">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round"
                 strokeLinecap="round"
                 strokeWidth="2.5"
                 fill="none"
                 stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input type="search" value={searchText} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search movie" className="input-sm" />
          </label>
          <div className="collection-switch" role="group" aria-label="Movie collection">
            <button
              type="button"
              className={`btn btn-sm ${collectionView === 'owned' ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => onCollectionViewChange('owned')}
            >
              Owned
            </button>
            <button
              type="button"
              className={`btn btn-sm ${collectionView === 'cart' ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => onCollectionViewChange('cart')}
            >
              In cart
            </button>
          </div>
          <button className="btn btn-success" onClick={openAddMovieModal}>Add Movie</button>
          <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>
              <h3 className="font-bold text-lg">Add a new movie to your collection !</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                <input type="text" name="title" value={movie.title} onChange={handleChange} className="input" placeholder="Title" required />
                <input type="text" name="director" value={movie.director} onChange={handleChange} className="input" placeholder="Director"/>
                <input type="number" name="releaseYear" value={movie.releaseYear} onChange={handleChange} className="input" placeholder="Release Year" min="1888"/>
                <div className="collection-switch modal-collection-switch" role="group" aria-label="Add movie to">
                  <button
                    type="button"
                    className={`btn btn-sm ${movieCollection === 'owned' ? 'btn-success' : 'btn-ghost'}`}
                    onClick={() => setMovieCollection('owned')}
                  >
                    Owned
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${movieCollection === 'cart' ? 'btn-success' : 'btn-ghost'}`}
                    onClick={() => setMovieCollection('cart')}
                  >
                    In cart
                  </button>
                </div>
                {errorMessage && <p role="alert">{errorMessage}</p>}
                <button type="submit" className="btn btn-success" disabled={isSaving}>
                  {isSaving ? 'Adding...' : 'Add Movie'}
                </button>
              </form>
            </div>
        </dialog>  
      </div>
    </div>
    </>
  )
}

export default TopSection
