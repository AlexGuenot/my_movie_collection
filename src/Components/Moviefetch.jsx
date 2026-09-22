import React, {useState, useEffect} from 'react'
function MovieFetch() {
 const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const URL = 'https://api.themoviedb.org/3/list/8698198?language=en-US&page=1'
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MzZlMTMwZTdmMTBkMmEwODJkMTgzYTM5MjcwNGY4ZSIsIm5iZiI6MTc4OTU1Nzk4MS42ODIsInN1YiI6IjZhYWE3Y2RkZmE0YjQ2ZmRiZjE0NjZhOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MkJIaGWnavDJt6wwf3i5kHMu_0n5TkM4PyXPrJ6lghM'
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(URL, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${AUTH_TOKEN}`
            // Add any additional headers as needed
          }
          // Include body for POST requests
          // body: JSON.stringify({ key: 'value' }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()
        setData(Array.isArray(result) ? result : result.items || [])       
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <p>Loading data...</p>
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>
  }

  return (
    <div>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default MovieFetch
