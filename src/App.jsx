import './App.css'
import TopSection from './Components/TopSection.jsx'
import MoviesTable from './Components/MoviesTable.jsx'
function App() {
  return (
    <div className="main-container">
      <div className="menu-container">
        <TopSection/>
        <MoviesTable/>
      </div>
    </div>
  )
}

export default App
