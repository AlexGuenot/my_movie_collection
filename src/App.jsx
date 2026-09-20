import './App.css'
import {useState,useEffect} from 'react'
import TopSection from './Components/TopSection.jsx'
import MoviesTable from './Components/MoviesTable.jsx'
import MovieFetch from './Components/Moviefetch.jsx'
function App() {
  const [searchText, setSearchText] = useState("");
  return (
    <div className="main-container">
      <div className="menu-container">
        <TopSection searchText={searchText} onSearchChange={setSearchText} />
        <MoviesTable searchText={searchText}/>
        <MovieFetch/>
      </div>
    </div>
  )
}

export default App
