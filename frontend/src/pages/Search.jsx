import React from 'react';

function Search() {
  return (
    <div className="search-page">
      <h1>Search</h1>
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search for movies, TV shows, and more..."
          className="search-input"
        />
        <button className="search-button">Search</button>
      </div>
      <div className="search-results">
        <p>Search results will appear here</p>
      </div>
    </div>
  );
}

export default Search;