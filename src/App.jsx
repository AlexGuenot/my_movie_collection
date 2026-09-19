import './App.css'
import TopSection from './Components/TopSection.jsx'
function App() {
  return (
    <div className="main-container">
      <div className="nav-container">Navigation container</div>
      <div className="menu-container">
        <TopSection/>
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
              <tbody>
                {/* row 1 */}
                <tr>
                  <th>1</th>
                  <td>Fight Club</td>
                  <td>David Fincher</td>
                  <td>
                    <button className="btn btn-outlined btn-warning">Edit</button>
                    <button className="btn btn-outlined btn-error">Delete</button>
                  </td>
                </tr>
                {/* row 2 */}
                <tr>
                  <th>2</th>
                  <td>Pulp Fiction</td>
                  <td>Quentin Tarantino</td>
                  <td>
                    <button className="btn btn-outlined btn-warning">Edit</button>
                    <button className="btn btn-outlined btn-error">Delete</button>
                  </td>
                </tr>
                {/* row 3 */}
                <tr>
                  <th>3</th>
                  <td>The Dark Knight</td>
                  <td>Christopher Nolan</td>
                  <td>
                    <button className="btn btn-outlined btn-warning">Edit</button>
                    <button className="btn btn-outlined btn-error">Delete</button>
                  </td>
                </tr>
                {/* row 4 */}
                <tr>
                  <th>4</th>
                  <td>Spider-Man : Into the Spider-Verse</td>
                  <td>Bob Persichetti</td>
                  <td>
                    <button className="btn btn-outlined btn-warning">Edit</button>
                    <button className="btn btn-outlined btn-error">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
