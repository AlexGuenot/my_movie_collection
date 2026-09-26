import './MoviesTable.css'
import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../createClient.js'

const moviePosters = {
  pulpfiction: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  killbill: 'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
}

function MoviesTable({ searchText, movies, collectionView, onMoviesLoaded, onMovieDeleted, onMovieRestored, onMovieUpdated }) {
  const [deletedMovie, setDeletedMovie] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isUndoing, setIsUndoing] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('table')
  const [flippedCardId, setFlippedCardId] = useState(null)
  const [focusedCardId, setFocusedCardId] = useState(null)
  const [activeFocusedCardId, setActiveFocusedCardId] = useState(null)
  const [cardDraft, setCardDraft] = useState(null)
  const normalizedSearch = searchText.trim().toLowerCase();
  const moviesInView = movies.filter((movie) =>
    collectionView === 'cart' ? isMovieInCart(movie) : !isMovieInCart(movie)
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
      setIsLoading(false)
      setLoadError('Could not load movies. Check the Supabase SELECT policy for the movies table.')
      return
    }
    setIsLoading(false)
    setLoadError('')
    onMoviesLoaded(data ?? [])
  }

  function isMovieInCart(movie) {
    return movie.is_owned === false || movie.is_owned === 'false'
  }

  function getPosterUrl(movie) {
    if (Object.prototype.hasOwnProperty.call(movie, 'poster_url')) {
      return movie.poster_url || null
    }

    const normalizedTitle = movie.title?.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalizedTitle?.startsWith('pulpfiction')) {
      return moviePosters.pulpfiction
    }
    if (normalizedTitle?.startsWith('killbill')) {
      return moviePosters.killbill
    }

    return null
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
    if (focusedCardId === movieId) {
      closeFocusedCard()
    }
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

  function openDetails(movie) {
    setSelectedMovie(movie)
    setEditingField(null)
    document.getElementById('movie_details_modal').showModal()
  }

  function startEditing(field) {
    setEditingField(field)
    setSaveError('')
    setEditValue(field === 'is_owned'
      ? selectedMovie.is_owned === false ? 'cart' : 'owned'
      : field === 'poster_url' ? selectedMovie.poster_url ?? getPosterUrl(selectedMovie) ?? ''
      : selectedMovie[field] ?? '')
  }

  async function saveField(field) {
    setIsSaving(true)
    setSaveError('')
    const value = field === 'release_year'
      ? String(editValue).trim() ? Number(editValue) : null
      : field === 'is_owned'
        ? editValue === 'owned'
        : editValue
    const { data, error } = await supabase
      .from('movies')
      .update({ [field]: value })
      .eq('id', selectedMovie.id)
      .select('id')

    if (error) {
      console.error(error)
      setIsSaving(false)
      setSaveError(error.code === '42501'
        ? 'Could not save this change. Check the movies table UPDATE policy.'
        : `Could not save this change: ${error.message}`)
      return
    }

    if (!data?.length) {
      setIsSaving(false)
      setSaveError('No movie was updated. Check the movies table UPDATE policy.')
      return
    }

    const updatedMovie = { ...selectedMovie, [field]: value }
    setSelectedMovie(updatedMovie)
    setEditingField(null)
    setIsSaving(false)
    onMovieUpdated(updatedMovie)
  }

  function startCardEdit(movie, event) {
    event.stopPropagation()
    const card = event.currentTarget.closest('.movie-card')
    const bounds = card.getBoundingClientRect()
    card.style.setProperty('--card-start-left', `${bounds.left}px`)
    card.style.setProperty('--card-start-top', `${bounds.top}px`)
    card.style.setProperty('--card-start-width', `${bounds.width}px`)
    card.style.setProperty('--card-start-height', `${bounds.height}px`)
    setSelectedMovie(movie)
    setEditingField(null)
    setSaveError('')
    setCardDraft({
      title: movie.title ?? '',
      director: movie.director ?? '',
      releaseYear: movie.release_year ?? '',
      collection: isMovieInCart(movie) ? 'cart' : 'owned',
      posterUrl: movie.poster_url ?? getPosterUrl(movie) ?? '',
    })
    setFocusedCardId(movie.id)
    requestAnimationFrame(() => setActiveFocusedCardId(movie.id))
    setTimeout(() => setFlippedCardId(movie.id), 720)
  }

  function closeFocusedCard() {
    setFocusedCardId(null)
    setActiveFocusedCardId(null)
    setFlippedCardId(null)
    setEditingField(null)
    setSaveError('')
    setCardDraft(null)
  }

  async function saveCardChanges(movie) {
    if (!cardDraft) {
      return
    }

    setIsSaving(true)
    setSaveError('')
    const changes = {
      title: cardDraft.title,
      director: cardDraft.director,
      release_year: String(cardDraft.releaseYear).trim() ? Number(cardDraft.releaseYear) : null,
      is_owned: cardDraft.collection === 'owned',
      poster_url: cardDraft.posterUrl,
    }
    const { data, error } = await supabase
      .from('movies')
      .update(changes)
      .eq('id', movie.id)
      .select('id')

    if (error || !data?.length) {
      console.error(error)
      setIsSaving(false)
      setSaveError(error?.message ?? 'Could not save this movie.')
      return
    }

    const updatedMovie = { ...movie, ...changes }
    onMovieUpdated(updatedMovie)
    setIsSaving(false)
    closeFocusedCard()
  }

  return (
    <>
        <div className="results-toolbar">
          <div className="view-switch" role="group" aria-label="Movie view">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-success' : 'btn-ghost'}`}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
              title="Table view"
              onClick={() => setViewMode('table')}
            >
              <span aria-hidden="true">☷</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'cards' ? 'btn-success' : 'btn-ghost'}`}
              aria-label="Card view"
              aria-pressed={viewMode === 'cards'}
              title="Card view"
              onClick={() => setViewMode('cards')}
            >
              <span aria-hidden="true">▤</span>
            </button>
          </div>
        </div>
        <div className={`table-results ${viewMode === 'cards' ? 'cards-results' : ''}`}>
          {loadError && <p role="alert">{loadError}</p>}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    <th>Movie Title</th>
                    <th>Director</th>
                    <th>Release</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.director || 'Unknown'}</td>
                      <td>{item.release_year || 'Unknown'}</td>
                      <td>
                        <button className="btn btn-outlined btn-info" onClick={() => openDetails(item)}>Edit</button>
                        <button
                          className="btn btn-outlined btn-error"
                          onClick={() => deleteMovie(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {isLoading && (
                    <tr>
                      <td colSpan="4">Loading movies...</td>
                    </tr>
                  )}
                  {!isLoading && filteredMovies.length === 0 && (
                    <tr>
                      <td colSpan="4">No movies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="movie-card-grid">
              {filteredMovies.map((item) => {
                const posterUrl = getPosterUrl(item)
                return (
                              <Fragment key={item.id}>
                                {focusedCardId === item.id && <div className="movie-card-placeholder" aria-hidden="true" />}
                                <article
                                  className={`movie-card ${flippedCardId === item.id ? 'is-flipped' : ''} ${focusedCardId === item.id ? 'is-focused' : ''} ${activeFocusedCardId === item.id ? 'is-focused-active' : ''}`}
                                  aria-label={`${item.title} movie card`}
                                >
                    <div className="movie-card-inner">
                      <div
                        className={`movie-card-face movie-card-front ${posterUrl ? '' : 'movie-card-no-poster'}`}
                        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
                      >
                        <div className="movie-card-content">
                          {focusedCardId !== item.id && (
                            <div className="movie-card-actions">
                              <button type="button" className="btn btn-sm btn-info" onClick={(event) => startCardEdit(item, event)}>Edit</button>
                              <button type="button" className="btn btn-sm btn-error" onClick={(event) => { event.stopPropagation(); deleteMovie(item.id) }}>Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="movie-card-face movie-card-back">
                        {focusedCardId === item.id && <div className="movie-card-details">
                          <label className="movie-card-edit-field">
                            <strong>Title</strong>
                            <input className="input input-sm" type="text" value={focusedCardId === item.id && cardDraft ? cardDraft.title : item.title} onChange={(event) => setCardDraft((draft) => ({ ...draft, title: event.target.value }))} />
                          </label>
                          <label className="movie-card-edit-field">
                            <strong>Director</strong>
                            <input className="input input-sm" type="text" value={focusedCardId === item.id && cardDraft ? cardDraft.director : item.director ?? ''} onChange={(event) => setCardDraft((draft) => ({ ...draft, director: event.target.value }))} />
                          </label>
                          <label className="movie-card-edit-field">
                            <strong>Release</strong>
                            <input className="input input-sm" type="number" min="1888" value={focusedCardId === item.id && cardDraft ? cardDraft.releaseYear : item.release_year ?? ''} onChange={(event) => setCardDraft((draft) => ({ ...draft, releaseYear: event.target.value }))} />
                          </label>
                          <label className="movie-card-edit-field">
                            <strong>Collection</strong>
                            <select className="select select-sm" value={focusedCardId === item.id && cardDraft ? cardDraft.collection : isMovieInCart(item) ? 'cart' : 'owned'} onChange={(event) => setCardDraft((draft) => ({ ...draft, collection: event.target.value }))}>
                              <option value="owned">Owned</option>
                              <option value="cart">In cart</option>
                            </select>
                          </label>
                          <label className="movie-card-edit-field">
                            <strong>Poster URL</strong>
                            <input className="input input-sm" type="url" value={focusedCardId === item.id && cardDraft ? cardDraft.posterUrl : getPosterUrl(item) ?? ''} onChange={(event) => setCardDraft((draft) => ({ ...draft, posterUrl: event.target.value }))} />
                          </label>
                          {saveError && <p className="movie-card-save-error" role="alert">{saveError}</p>}
                          <button type="button" className="btn btn-sm btn-success movie-card-save-button" onClick={() => saveCardChanges(item)} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>}
                      </div>
                    </div>
                  </article>
                </Fragment>
                )
              })}
              {isLoading && <p>Loading movies...</p>}
              {!isLoading && filteredMovies.length === 0 && <p>No movies found.</p>}
            </div>
          )}
        </div>
        <dialog
          id="movie_details_modal"
          className="modal"
          onClose={() => {
            setFocusedCardId(null)
            setActiveFocusedCardId(null)
            setFlippedCardId(null)
          }}
        >
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            {selectedMovie && (
              <>
                <h3 className="font-bold text-lg">Movie details</h3>
                <div className="movie-detail-poster-wrap">
                  {getPosterUrl(selectedMovie) ? (
                    <img
                      className="movie-detail-poster"
                      src={getPosterUrl(selectedMovie)}
                      alt={`Poster for ${selectedMovie.title}`}
                    />
                  ) : (
                    <div className="movie-detail-poster-empty">No poster available</div>
                  )}
                  <button
                    type="button"
                    className="edit-poster-button"
                    aria-label="Edit poster URL"
                    title="Edit poster URL"
                    onClick={() => startEditing('poster_url')}
                  >
                    ✎
                  </button>
                </div>
                {editingField === 'poster_url' && (
                  <div className="movie-detail-field">
                    <strong>Poster URL:</strong>
                    <input
                      className="input input-sm"
                      type="url"
                      placeholder="https://..."
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => saveField('poster_url')}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
                <div className="py-4">
                  {[
                    ['title', 'Title', selectedMovie.title],
                    ['director', 'Director', selectedMovie.director || 'Unknown'],
                    ['release_year', 'Release year', selectedMovie.release_year || 'Unknown'],
                    ['is_owned', 'Collection', selectedMovie.is_owned === false ? 'In cart' : 'Owned'],
                  ].map(([field, label, value]) => (
                    <div className="movie-detail-field" key={field}>
                      <strong>{label}:</strong>
                      {editingField === field ? (
                        <>
                          {field === 'is_owned' ? (
                            <select
                              className="select select-sm"
                              value={editValue}
                              onChange={(event) => setEditValue(event.target.value)}
                              autoFocus
                            >
                              <option value="owned">Owned</option>
                              <option value="cart">In cart</option>
                            </select>
                          ) : (
                            <input
                              className="input input-sm"
                              type={field === 'release_year' ? 'number' : field === 'poster_url' ? 'url' : 'text'}
                              placeholder={field === 'poster_url' ? 'https://...' : undefined}
                              value={editValue}
                              onChange={(event) => setEditValue(event.target.value)}
                              autoFocus
                            />
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => saveField(field)}
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{value}</span>
                          <button
                            className="edit-field-button"
                            aria-label={`Edit ${label}`}
                            title={`Edit ${label}`}
                            onClick={() => startEditing(field)}
                          >
                            ✎
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  {saveError && <p role="alert">{saveError}</p>}
                </div>
              </>
            )}
          </div>
        </dialog>
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
