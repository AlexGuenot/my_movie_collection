import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="main-container">
      <div className="nav-container">Navigation container</div>
      <div className="menu-container">
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
            <input type="search" required placeholder="Search movie" className="input-sm" />
          </label>
          <button className="btn btn-success">Add Movie</button>  
          </div>
          
        </div>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
