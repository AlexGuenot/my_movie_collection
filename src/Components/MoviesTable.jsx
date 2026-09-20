import './MoviesTable.css'
import data from '../data/MoviesData.json'
function MoviesTable() {
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
                {data.map((item) => (
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
              </tbody>
            </table>
          </div>
        </div>
  )
}

export default MoviesTable
