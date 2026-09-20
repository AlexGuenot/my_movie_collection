import React, {useEffect} from 'react'

function Moviefetch() {
const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MzZlMTMwZTdmMTBkMmEwODJkMTgzYTM5MjcwNGY4ZSIsIm5iZiI6MTc4OTU1Nzk4MS42ODIsInN1YiI6IjZhYWE3Y2RkZmE0YjQ2ZmRiZjE0NjZhOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MkJIaGWnavDJt6wwf3i5kHMu_0n5TkM4PyXPrJ6lghM'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));


  return (
    <div>
    </div>
  )
}

export default Moviefetch
