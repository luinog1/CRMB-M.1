import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import ApiService from '../services/api';

const HomePage = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiError, setApiError] = useState(null);

  // Test backend connectivity on component mount
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const healthCheck = await ApiService.checkHealth();
        console.log('Backend health check successful:', healthCheck);
        setBackendStatus('connected');
        
        // Test trending endpoint
        try {
          await ApiService.getTrending();
        } catch (error) {
          console.log('Trending endpoint not implemented yet (expected):', error.message);
        }
        
        // Test new releases endpoint
        try {
          await ApiService.getNewReleases();
        } catch (error) {
          console.log('New releases endpoint not implemented yet (expected):', error.message);
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setBackendStatus('disconnected');
        setApiError(error.message);
      }
    };

    testBackendConnection();
  }, []);

  // Mock data for featured movie
  const featuredMovie = {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    year: "2008",
    rating: "9.0",
    genre: "Action, Crime, Drama",
    backdrop: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20knight%20batman%20gotham%20city%20cinematic%20night%20scene&image_size=landscape_16_9"
  };

  // Mock data for movies
  const mockMovies = [
    { id: 1, title: "Inception", year: "2010", rating: "8.8", genre: "Sci-Fi, Thriller" },
    { id: 2, title: "Interstellar", year: "2014", rating: "8.6", genre: "Sci-Fi, Drama" },
    { id: 3, title: "The Matrix", year: "1999", rating: "8.7", genre: "Action, Sci-Fi" },
    { id: 4, title: "Pulp Fiction", year: "1994", rating: "8.9", genre: "Crime, Drama" },
    { id: 5, title: "Fight Club", year: "1999", rating: "8.8", genre: "Drama, Thriller" }
  ];

  const handleWatchNow = () => {
    console.log('Playing featured movie:', featuredMovie.title);
  };

  const handleAddToLibrary = () => {
    console.log('Adding to library:', featuredMovie.title);
  };

  return (
    <div className="home-page">
      {/* Backend Status Indicator */}
      <div className="backend-status" style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        zIndex: 1000,
        backgroundColor: backendStatus === 'connected' ? '#10b981' : 
                        backendStatus === 'disconnected' ? '#ef4444' : '#f59e0b',
        color: 'white'
      }}>
        Backend: {backendStatus === 'connected' ? '✓ Connected' : 
                 backendStatus === 'disconnected' ? '✗ Disconnected' : '⏳ Checking...'}
        {apiError && <div style={{ fontSize: '10px', marginTop: '2px' }}>Error: {apiError}</div>}
      </div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div 
          className="hero-background"
          style={{
            backgroundImage: `url(${featuredMovie.backdrop})`
          }}
        >
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-info">
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <div className="hero-meta">
              <span className="hero-year">{featuredMovie.year}</span>
              <span className="hero-rating">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {featuredMovie.rating}
              </span>
              <span className="hero-genre">{featuredMovie.genre}</span>
            </div>
            <p className="hero-description">{featuredMovie.description}</p>
            
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={handleWatchNow}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Now
              </button>
              <button className="btn btn-secondary" onClick={handleAddToLibrary}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add to Library
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="content-sections">
        {/* Trending Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <button className="section-link">View All</button>
          </div>
          <div className="content-carousel">
            <div className="carousel-container">
              {mockMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        </section>

        {/* New Releases Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">New Releases</h2>
            <button className="section-link">View All</button>
          </div>
          <div className="content-carousel">
            <div className="carousel-container">
              {mockMovies.slice().reverse().map(movie => (
                <MovieCard key={`new-${movie.id}`} movie={movie} />
              ))}
            </div>
          </div>
        </section>

        {/* Popular Section */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Popular Movies</h2>
            <button className="section-link">View All</button>
          </div>
          <div className="content-carousel">
            <div className="carousel-container">
              {mockMovies.slice(1, 4).map(movie => (
                <MovieCard key={`popular-${movie.id}`} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;