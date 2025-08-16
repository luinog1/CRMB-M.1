import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import ApiService from '../services/api';
import { useApp } from '../context/AppContext';

const HomePage = () => {
  const { settings } = useApp();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiError, setApiError] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load content and check backend connectivity on component mount or when settings change
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setApiError(null);
      
      // Check if TMDB API key is available
      if (!settings?.tmdbApiKey) {
        setApiError('TMDB API key is missing. Please add a valid API key in Settings.');
        setIsLoading(false);
        return;
      }
      
      try {
        // Set TMDB API key from settings
        ApiService.setApiKey('tmdb', settings.tmdbApiKey);
        
        // Check backend health
        const response = await ApiService.checkHealth();
        console.log('Backend health check:', response);
        setBackendStatus('connected');
        
        // Fetch trending content
        try {
          const trending = await ApiService.getTrending();
          console.log('Trending:', trending);
          if (trending && trending.results) {
            setTrendingMovies(trending.results.map(movie => ({
              id: movie.id,
              title: movie.title || movie.name,
              year: movie.release_date ? new Date(movie.release_date).getFullYear() : 
                    movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '',
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
              backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
              rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
              genre: movie.media_type || 'movie',
              overview: movie.overview,
              added: new Date().toISOString()
            })));
          }
        } catch (trendingError) {
          console.error('Failed to fetch trending:', trendingError.message);
          if (trendingError.message.includes('401')) {
            setApiError('TMDB API key is invalid. Please add a valid API key in Settings.');
          }
        }
        
        // Fetch new releases
        try {
          const releases = await ApiService.getNewReleases();
          console.log('New Releases:', releases);
          if (releases && releases.results) {
            setNewReleases(releases.results.map(movie => ({
              id: movie.id,
              title: movie.title || movie.name,
              year: movie.release_date ? new Date(movie.release_date).getFullYear() : '',
              poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
              backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
              rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
              genre: 'movie',
              overview: movie.overview,
              added: new Date().toISOString()
            })));
          }
        } catch (newReleasesError) {
          console.error('Failed to fetch new releases:', newReleasesError.message);
          if (!apiError && newReleasesError.message.includes('401')) {
            setApiError('TMDB API key is invalid. Please add a valid API key in Settings.');
          }
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        setBackendStatus('disconnected');
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [settings?.tmdbApiKey]);

  // Mock data for featured movie
  const featuredMovie = {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    year: "2008",
    rating: "9.0",
    genre: "Action, Crime, Drama",
    backdrop: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20knight%20batman%20gotham%20city%20cinematic%20night%20scene&image_size=landscape_16_9"
  };

  // Mock data for movies (with TMDB IDs for testing)
  const mockMovies = [
    { id: 27205, title: "Inception", year: "2010", rating: "8.8", genre: "movie", poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
    { id: 157336, title: "Interstellar", year: "2014", rating: "8.6", genre: "movie", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { id: 603, title: "The Matrix", year: "1999", rating: "8.7", genre: "movie", poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
    { id: 680, title: "Pulp Fiction", year: "1994", rating: "8.9", genre: "movie", poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
    { id: 550, title: "Fight Club", year: "1999", rating: "8.8", genre: "movie", poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" }
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
              {isLoading ? (
                <div className="loading-indicator">Loading trending content...</div>
              ) : apiError ? (
                <div className="no-content-message">{apiError}</div>
              ) : trendingMovies.length > 0 ? (
                trendingMovies.map(movie => (
                  <MovieCard key={`trending-${movie.id}`} movie={movie} />
                ))
              ) : (
                <div className="no-content-message">No trending content found. Try again later.</div>
              )}
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
              {isLoading ? (
                <div className="loading-indicator">Loading new releases...</div>
              ) : apiError ? (
                <div className="no-content-message">{apiError}</div>
              ) : newReleases.length > 0 ? (
                newReleases.map(movie => (
                  <MovieCard key={`new-${movie.id}`} movie={movie} />
                ))
              ) : (
                <div className="no-content-message">No new releases found. Try again later.</div>
              )}
            </div>
          </div>
        </section>

        {/* Popular Section - Using trending data for now */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Popular Movies</h2>
            <button className="section-link">View All</button>
          </div>
          <div className="content-carousel">
            <div className="carousel-container">
              {isLoading ? (
                <div className="loading-indicator">Loading popular movies...</div>
              ) : apiError ? (
                <div className="no-content-message">{apiError}</div>
              ) : trendingMovies.length > 0 ? (
                trendingMovies.slice(0, 5).map(movie => (
                  <MovieCard key={`popular-${movie.id}`} movie={movie} />
                ))
              ) : (
                <div className="no-content-message">No popular movies found. Try again later.</div>
              )}
            </div>
          </div>
        </section>

        {/* Demo Section - Always shows test content for addon testing */}
        <section className="content-section">
          <div className="section-header">
            <h2 className="section-title">Demo Movies (Click to Test Detail Page)</h2>
            <button className="section-link">View All</button>
          </div>
          <div className="content-carousel">
            <div className="carousel-container">
              {mockMovies.map(movie => (
                <MovieCard key={`demo-${movie.id}`} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;