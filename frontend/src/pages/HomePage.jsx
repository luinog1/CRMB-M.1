import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import ApiService from '../services/api';
import { useApp } from '../context/AppContext';

const HomePage = () => {
  const { settings } = useApp();
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [apiError, setApiError] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasContent, setHasContent] = useState(false);

  // Load content and check backend connectivity on component mount or when settings change
  useEffect(() => {
    const loadContent = async () => {
      console.group('🏠 HomePage - Loading Content');
      setIsLoading(true);
      setApiError(null);

      try {
        // Check backend health first
        console.log('🔍 Checking backend health...');
        const healthCheck = await ApiService.checkHealth();
        console.log('✅ Backend health check successful:', healthCheck);
        setBackendStatus('connected');

        // Load content using the new simplified API
        try {
          // Get trending movies
          console.log('🔍 Fetching trending movies...');
          const trendingMoviesData = await ApiService.getCatalog('movie', 'trending');
          console.log('📋 Trending movies response:', trendingMoviesData);

          if (trendingMoviesData && trendingMoviesData.length > 0) {
            console.log(`✅ Received ${trendingMoviesData.length} trending movies`);

            // Normalize movie data to ensure it has required fields
            const normalizedMovies = trendingMoviesData.map(movie => ({
              ...movie,
              title: movie.title || movie.name || 'Unknown Title',
              id: movie.id || `unknown-${Math.random().toString(36).substring(7)}`,
              type: movie.type || 'movie'
            }));

            setTrendingMovies(normalizedMovies.slice(0, 6));
            setHasContent(true);
          } else {
            console.warn('⚠️ No trending movies received');
          }

          // Get popular movies for additional content
          console.log('🔍 Fetching popular movies...');
          const popularMoviesData = await ApiService.getCatalog('movie', 'popular');
          console.log('📋 Popular movies response:', popularMoviesData);

          if (popularMoviesData && popularMoviesData.length > 0) {
            console.log(`✅ Received ${popularMoviesData.length} popular movies`);

            const normalizedPopular = popularMoviesData.map(item => ({
              ...item,
              title: item.title || item.name || 'Unknown Title',
              id: item.id || `unknown-${Math.random().toString(36).substring(7)}`,
              type: item.type || 'movie'
            }));

            setPopularMovies(normalizedPopular.slice(0, 6));
          }

          // Get popular series
          console.log('🔍 Fetching popular series...');
          const popularSeriesData = await ApiService.getCatalog('series', 'popular');
          console.log('📋 Popular series response:', popularSeriesData);

          if (popularSeriesData && popularSeriesData.length > 0) {
            console.log(`✅ Received ${popularSeriesData.length} popular series`);

            const normalizedSeries = popularSeriesData.map(item => ({
              ...item,
              title: item.title || item.name || 'Unknown Title',
              id: item.id || `unknown-${Math.random().toString(36).substring(7)}`,
              type: item.type || 'series'
            }));

            setPopularSeries(normalizedSeries.slice(0, 6));
          }

          // Get new releases if available
          console.log('🔍 Fetching new releases...');
          const newReleasesData = await ApiService.getCatalog('movie', 'new');
          console.log('📋 New releases response:', newReleasesData);

          if (newReleasesData && newReleasesData.length > 0) {
            console.log(`✅ Received ${newReleasesData.length} new releases`);

            const normalizedNew = newReleasesData.map(item => ({
              ...item,
              title: item.title || item.name || 'Unknown Title',
              id: item.id || `unknown-${Math.random().toString(36).substring(7)}`,
              type: item.type || 'movie'
            }));

            setNewReleases(normalizedNew.slice(0, 6));
          }
        } catch (contentError) {
          console.warn('⚠️ Failed to load content:', contentError.message);
        }

      } catch (error) {
        console.error('❌ Failed to load content:', error);
        setBackendStatus('disconnected');
        setApiError(error.message);
      } finally {
        setIsLoading(false);
        console.log('🏁 Content loading complete. Has content:', hasContent);
        console.groupEnd();
      }
    };

    loadContent();
  }, [settings, hasContent]);

  const handlePlay = (movie) => {
    console.log('Playing:', movie.title || movie.name);
    // Implement play functionality
    if (movie && movie.id) {
      // Navigate to detail page with play action
      navigate(`/detail/${movie.type || 'movie'}/${movie.id}`, {
        state: { action: 'play' }
      });
    } else {
      console.error('Invalid movie data for play action');
    }
  };

  const handleMoreInfo = (movie) => {
    console.log('More info for:', movie.title || movie.name);
    // Navigate to detail page
    if (movie && movie.id) {
      navigate(`/detail/${movie.type || 'movie'}/${movie.id}`);
    } else {
      console.error('Invalid movie data for more info');
    }
  };

  const handleAddToMyList = (movie) => {
    console.log('Added to my list:', movie.title);
    // Implement add to list functionality
    if (movie && movie.id) {
      // Add to user's list
      ApiService.addToMyList(movie.id, movie.type || 'movie')
        .then(() => {
          console.log('Successfully added to my list');
          // You might want to show a success notification here
        })
        .catch(error => {
          console.error('Failed to add to my list:', error);
          // You might want to show an error notification here
        });
    } else {
      console.error('Invalid movie data for add to list');
    }
  };

  const handleConfigureSettings = () => {
    // Navigate to settings
    window.location.hash = '#settings';
  };

  const handleRefreshContent = () => {
    // Reload the page to refresh content
    window.location.reload();
  };

  const handleViewAll = () => {
    navigate('/library');
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
            Configure your API keys and services to start building your library of movies and shows.
          </p>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleConfigureSettings}>
              Configure Settings
            </button>
            <button className="btn btn-secondary" onClick={handleRefreshContent}>
              Refresh Content
            </button>
          </div>
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
          <div className="featured-year">{trendingMovies[0]?.year || trendingMovies[0]?.releaseInfo || '2024'}</div>
          <div className="featured-label">Featured</div>
          <h1 className="featured-title">{trendingMovies[0]?.title || trendingMovies[0]?.name || 'Featured Content'}</h1>
          <p className="featured-description">
            {trendingMovies[0]?.overview || trendingMovies[0]?.description || 'Discover amazing movies and shows from your configured addons. Your next favorite entertainment is just a click away.'}
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
            <button className="view-all" onClick={handleViewAll}>View All</button>
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
            <button className="view-all" onClick={handleViewAll}>View All</button>
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
            <h2 className="section-title">Popular Movies</h2>
            <button className="view-all" onClick={handleViewAll}>View All</button>
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

      {popularSeries.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Popular Series</h2>
            <button className="view-all" onClick={handleViewAll}>View All</button>
          </div>
          <div className="movie-grid">
            {popularSeries.map((series) => (
              <MovieCard
                key={series.id}
                movie={series}
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