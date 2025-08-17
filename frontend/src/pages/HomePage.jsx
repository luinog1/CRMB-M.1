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
  const [popularMovies, setPopularMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addonCatalogs, setAddonCatalogs] = useState([]);
  const [hasContent, setHasContent] = useState(false);

  // Load content and check backend connectivity on component mount or when settings change
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        // Check backend health first
        const healthCheck = await ApiService.checkHealth();
        setBackendStatus('connected');

        // Try to load content from addons
        const addons = await ApiService.getAddons();
        if (addons && addons.length > 0) {
          // Load catalog from first available addon
          const catalog = await ApiService.getAddonCatalog('cinemeta', 'movie', 'top');
          if (catalog && catalog.metas && catalog.metas.length > 0) {
            setTrendingMovies(catalog.metas.slice(0, 6));
            setHasContent(true);
          }
        }

        // If no addon content, try TMDB (if API key is available)
        if (!hasContent && settings.tmdbApiKey) {
          try {
            const tmdbTrending = await ApiService.getTrending('movie', 'week');
            if (tmdbTrending && tmdbTrending.results) {
              setTrendingMovies(tmdbTrending.results.slice(0, 6));
              setHasContent(true);
            }
          } catch (tmdbError) {
            console.log('TMDB not available:', tmdbError.message);
          }
        }

      } catch (error) {
        console.error('Failed to load content:', error);
        setBackendStatus('disconnected');
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [settings, hasContent]);

  const handlePlay = (movie) => {
    console.log('Playing:', movie.title);
    // TODO: Implement play functionality
  };

  const handleMoreInfo = (movie) => {
    console.log('More info for:', movie.title);
    // TODO: Navigate to detail page
  };

  const handleAddToMyList = (movie) => {
    console.log('Added to my list:', movie.title);
    // TODO: Implement add to list functionality
  };

  const handleConfigureAddons = () => {
    // Navigate to settings/addon manager
    window.location.hash = '#settings';
  };

  const handleSyncAddons = async () => {
    try {
      await ApiService.syncAddons();
      // Reload content after sync
      window.location.reload();
    } catch (error) {
      console.error('Failed to sync addons:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="content-container">
        <div className="error-container">
          <h2>Connection Error</h2>
          <p>{apiError}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div className="content-container">
        {/* Featured Content Section */}
        <div className="featured-section">
          <div className="featured-rating">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            8.5
          </div>
          <div className="featured-year">2024</div>
          <div className="featured-label">Featured</div>
          <h1 className="featured-title">Featured Content</h1>
          <p className="featured-description">
            Discover amazing movies and shows from your configured addons. Your next favorite entertainment is just a click away.
          </p>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handlePlay}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play
            </button>
            <button className="btn btn-secondary" onClick={handleAddToMyList}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              + My List
            </button>
            <button className="btn btn-secondary" onClick={handleMoreInfo}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              More Info
            </button>
          </div>
        </div>

        {/* No Content State */}
        <div className="no-content">
          <svg className="no-content-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <h2 className="no-content-title">No Content Available</h2>
          <p className="no-content-description">
            Add and configure some addons, then sync them to start building your library of movies and shows.
          </p>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleConfigureAddons}>
              Configure Addons
            </button>
            <button className="btn btn-secondary" onClick={handleSyncAddons}>
              Sync Addons
            </button>
          </div>
        </div>

        {/* Sync Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn btn-secondary" onClick={handleSyncAddons}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            Sync Addons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      {/* Featured Content Section */}
      {trendingMovies.length > 0 && (
        <div className="featured-section">
          <div className="featured-rating">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {trendingMovies[0]?.rating || '8.5'}
          </div>
          <div className="featured-year">{trendingMovies[0]?.year || '2024'}</div>
          <div className="featured-label">Featured</div>
          <h1 className="featured-title">{trendingMovies[0]?.title || 'Featured Content'}</h1>
          <p className="featured-description">
            {trendingMovies[0]?.overview || 'Discover amazing movies and shows from your configured addons. Your next favorite entertainment is just a click away.'}
          </p>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => handlePlay(trendingMovies[0])}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play
            </button>
            <button className="btn btn-secondary" onClick={() => handleAddToMyList(trendingMovies[0])}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              + My List
            </button>
            <button className="btn btn-secondary" onClick={() => handleMoreInfo(trendingMovies[0])}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              More Info
            </button>
          </div>
        </div>
      )}

      {/* Content Sections */}
      {trendingMovies.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="movie-grid">
            {trendingMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={handlePlay}
                onMoreInfo={handleMoreInfo}
              />
            ))}
          </div>
        </div>
      )}

      {newReleases.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">New Releases</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="movie-grid">
            {newReleases.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={handlePlay}
                onMoreInfo={handleMoreInfo}
              />
            ))}
          </div>
        </div>
      )}

      {popularMovies.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Popular</h2>
            <button className="view-all">View All</button>
          </div>
          <div className="movie-grid">
            {popularMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlay={handlePlay}
                onMoreInfo={handleMoreInfo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;