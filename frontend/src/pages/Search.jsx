import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import ApiService from '../services/api';

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('movie');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await ApiService.stremioSearch(searchType, query);
      setResults(searchResults.metas || []);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePlay = (item) => {
    console.log('Playing:', item.title || item.name);
    // TODO: Implement play functionality
  };

  const handleMoreInfo = (item) => {
    const type = item.type || searchType;
    const id = item.id || item.imdb_id;
    if (id) {
      navigate(`/detail/${type}/${id}`);
    }
  };

  return (
    <div className="search-page">
      <h1>Search</h1>
      <div className="search-container">
        <div className="search-type-selector">
          <button
            className={`search-type-button ${searchType === 'movie' ? 'active' : ''}`}
            onClick={() => setSearchType('movie')}
          >
            Movies
          </button>
          <button
            className={`search-type-button ${searchType === 'series' ? 'active' : ''}`}
            onClick={() => setSearchType('series')}
          >
            TV Shows
          </button>
        </div>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for movies, TV shows, and more..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}
      
      {error && (
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
        </div>
      )}
      
      <div className="search-results">
        {!isLoading && !error && results.length === 0 && query && (
          <p className="no-results">No results found for "{query}"</p>
        )}
        
        {results.length > 0 && (
          <div className="results-grid">
            {results.map((item) => (
              <MovieCard
                key={item.id || item.imdb_id}
                movie={item}
                onPlay={() => handlePlay(item)}
                onMoreInfo={() => handleMoreInfo(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;