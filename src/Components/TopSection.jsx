import './TopSection.css'
import { useEffect, useState } from 'react'
import { supabase } from '../createClient.js'

const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY
const posterSuggestions = {
  'pulp fiction': 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  'kill bill': 'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
}

function TopSection({ searchText, onSearchChange, collectionView, onCollectionViewChange, onMovieAdded }) {
  const [movie, setMovie] = useState({ title: '', director: '', releaseYear: '', posterUrl: '' })
  const [movieCollection, setMovieCollection] = useState('owned')
  const [movieSuggestions, setMovieSuggestions] = useState([])
  const [suggestionError, setSuggestionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const query = movie.title.trim()
    if (query.length < 2 || !tmdbApiKey) {
      setMovieSuggestions([])
      setSuggestionError('')
      return undefined
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(async () => {
      try {
        const searchUrl = new URL('https://api.themoviedb.org/3/search/movie')
        searchUrl.searchParams.set('query', query)
        searchUrl.searchParams.set('include_adult', 'false')
        searchUrl.searchParams.set('language', 'en-US')
        searchUrl.searchParams.set('page', '1')
        const isReadAccessToken = tmdbApiKey.length > 100
        if (!isReadAccessToken) {
          searchUrl.searchParams.set('api_key', tmdbApiKey)
        }
        const response = await fetch(searchUrl, {
          signal: controller.signal,
          headers: isReadAccessToken ? { Authorization: `Bearer ${tmdbApiKey}` } : undefined,
        })
        if (!response.ok) {
          throw new Error(`TMDB search failed with status ${response.status}`)
        }
        const result = await response.json()
        setMovieSuggestions(result.results?.slice(0, 3) ?? [])
        setSuggestionError('')
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(error)
          setMovieSuggestions([])
          setSuggestionError('TMDB suggestions are unavailable. Check your API key and restart Vite.')
        }
      }
    }, 350)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [movie.title])

  function handleChange(event) {
    const { name, value } = event.target
    const nextMovie = { ...movie, [name]: value }

    if (name === 'title') {
      const posterSuggestion = posterSuggestions[value.trim().toLowerCase()]
      if (posterSuggestion) {
        nextMovie.posterUrl = posterSuggestion
      }
    }

    setMovie(nextMovie)
  }

  async function selectMovieSuggestion(suggestion) {
    setMovie({
      ...movie,
      title: suggestion.title,
      releaseYear: suggestion.release_date?.slice(0, 4) ?? movie.releaseYear,
      posterUrl: suggestion.poster_path
        ? `https://image.tmdb.org/t/p/w500${suggestion.poster_path}`
        : '',
    })
    setMovieSuggestions([])

    if (!tmdbApiKey) {
      return
    }

    try {
      const detailsUrl = new URL(`https://api.themoviedb.org/3/movie/${suggestion.id}`)
      detailsUrl.searchParams.set('append_to_response', 'credits')
      detailsUrl.searchParams.set('language', 'en-US')
      const isReadAccessToken = tmdbApiKey.length > 100
      if (!isReadAccessToken) {
        detailsUrl.searchParams.set('api_key', tmdbApiKey)
      }
      const response = await fetch(detailsUrl, {
        headers: isReadAccessToken ? { Authorization: `Bearer ${tmdbApiKey}` } : undefined,
      })
      if (!response.ok) {
        throw new Error(`TMDB movie details failed with status ${response.status}`)
      }
      const details = await response.json()
      const director = details.credits?.crew?.find((person) => person.job === 'Director')?.name ?? ''
      setMovie((currentMovie) => ({
        ...currentMovie,
        director,
        releaseYear: details.release_date?.slice(0, 4) ?? currentMovie.releaseYear,
      }))
    } catch (error) {
      console.error(error)
    }
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
        release_year: movie.releaseYear ? Number(movie.releaseYear) : null,
        is_owned: movieCollection === 'owned',
        poster_url: movie.posterUrl,
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
    setMovie({ title: '', director: '', releaseYear: '', posterUrl: '' })
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
              {movie.posterUrl && (
                <img
                  className="movie-form-poster"
                  src={movie.posterUrl}
                  alt={`Poster for ${movie.title || 'selected movie'}`}
                />
              )}
              <h3 className="font-bold text-lg">Add a new movie to your collection !</h3>
              <form onSubmit={handleSubmit} className="movie-form flex flex-col gap-3 mt-4">
                <input type="text" name="title" value={movie.title} onChange={handleChange} className="input movie-form-full" placeholder="Title" required />
                {movieSuggestions.length > 0 && (
                  <div className="movie-suggestions movie-form-full" aria-label="Movie suggestions">
                    {movieSuggestions.map((suggestion) => (
                      <button
                        type="button"
                        className="movie-suggestion"
                        key={suggestion.id}
                        aria-label={`Select ${suggestion.title}`}
                        title={`${suggestion.title}${suggestion.release_date ? ` (${suggestion.release_date.slice(0, 4)})` : ''}`}
                        onClick={() => selectMovieSuggestion(suggestion)}
                      >
                        {suggestion.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${suggestion.poster_path}`}
                            alt={`Poster for ${suggestion.title}`}
                          />
                        ) : (
                          <span className="movie-suggestion-no-poster">No poster</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {suggestionError && <p className="movie-form-full" role="alert">{suggestionError}</p>}
                <input type="text" name="director" value={movie.director} onChange={handleChange} className="input" placeholder="Director"/>
                <input type="number" name="releaseYear" value={movie.releaseYear} onChange={handleChange} className="input" placeholder="Release Year" min="1888"/>
                <input type="url" name="posterUrl" value={movie.posterUrl} onChange={handleChange} className="input movie-form-full" placeholder="Poster URL (optional)"/>
                <div className="collection-switch modal-collection-switch movie-form-full" role="group" aria-label="Add movie to">
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
                {errorMessage && <p className="movie-form-full" role="alert">{errorMessage}</p>}
                <button type="submit" className="btn btn-success movie-form-full" disabled={isSaving}>
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
