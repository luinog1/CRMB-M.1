import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { useApp } from '../context/AppContext';

function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { settings } = useApp();
  
  const [tmdbData, setTmdbData] = useState(null);
  const [stremioData, setStremioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Set TMDB API key if available
        if (settings?.tmdbApiKey) {
          ApiService.setApiKey('tmdb', settings.tmdbApiKey);
        }
        
        // Fetch TMDB data
        let tmdbResponse;
        if (type === 'movie') {
          tmdbResponse = await ApiService.getMovieDetails(id);
        } else {
          tmdbResponse = await ApiService.getTvDetails(id);
        }
        setTmdbData(tmdbResponse);
        
        // Fetch Stremio metadata using TMDB ID
        try {
          const stremioResponse = await ApiService.getStremioMetadataByTmdb(type, id);
          setStremioData(stremioResponse);
        } catch (stremioError) {
          console.warn('Failed to fetch Stremio metadata:', stremioError.message);
          // Don't set error for Stremio failure, just log it
        }
        
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (type && id) {
      fetchMetadata();
    }
  }, [type, id, settings?.tmdbApiKey]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlay = () => {
    console.log('Playing:', tmdbData?.title || tmdbData?.name);
    // TODO: Implement play functionality
  };

  const handleAddToLibrary = () => {
    console.log('Adding to library:', tmdbData?.title || tmdbData?.name);
    // TODO: Implement add to library functionality
  };

  if (isLoading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading content details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page">
        <div className="error-container">
          <h2>Error Loading Content</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="btn btn-secondary">Go Back</button>
        </div>
      </div>
    );
  }

  if (!tmdbData) {
    return (
      <div className="detail-page">
        <div className="error-container">
          <h2>Content Not Found</h2>
          <p>The requested content could not be found.</p>
          <button onClick={handleBack} className="btn btn-secondary">Go Back</button>
        </div>
      </div>
    );
  }

  const title = tmdbData.title || tmdbData.name;
  const releaseDate = tmdbData.release_date || tmdbData.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const posterUrl = tmdbData.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}` : null;
  const backdropUrl = tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` : null;
  const rating = tmdbData.vote_average ? tmdbData.vote_average.toFixed(1) : 'N/A';
  const runtime = tmdbData.runtime || (tmdbData.episode_run_time && tmdbData.episode_run_time[0]);
  const genres = tmdbData.genres ? tmdbData.genres.map(g => g.name).join(', ') : '';

  return (
    <div className="detail-page">
      {/* Back Button */}
      <button onClick={handleBack} className="back-button">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>

      {/* Hero Section */}
      <div className="detail-hero" style={{ backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none' }}>
        <div className="detail-hero-overlay"></div>
        <div className="detail-hero-content">
          <div className="detail-poster">
            <img 
              src={posterUrl || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${title} movie poster`)}&image_size=portrait_4_3`}
              alt={title}
            />
          </div>
          <div className="detail-info">
            <h1 className="detail-title">{title}</h1>
            <div className="detail-meta">
              <span className="detail-year">{year}</span>
              <span className="detail-rating">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {rating}
              </span>
              {runtime && <span className="detail-runtime">{runtime} min</span>}
              <span className="detail-type">{type === 'movie' ? 'Movie' : 'TV Show'}</span>
            </div>
            {genres && <div className="detail-genres">{genres}</div>}
            <p className="detail-overview">{tmdbData.overview}</p>
            
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={handlePlay}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play
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
      </div>

      {/* Additional Details */}
      <div className="detail-sections">
        {/* Cast & Crew */}
        {tmdbData.credits && tmdbData.credits.cast && tmdbData.credits.cast.length > 0 && (
          <section className="detail-section">
            <h2>Cast</h2>
            <div className="cast-list">
              {tmdbData.credits.cast.slice(0, 10).map(person => (
                <div key={person.id} className="cast-member">
                  <img 
                    src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/placeholder-person.jpg'}
                    alt={person.name}
                  />
                  <div className="cast-info">
                    <div className="cast-name">{person.name}</div>
                    <div className="cast-character">{person.character}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stremio Metadata */}
        {stremioData && stremioData.meta && (
          <section className="detail-section">
            <h2>Additional Information</h2>
            <div className="stremio-info">
              {stremioData.meta.director && (
                <div className="info-item">
                  <strong>Director:</strong> {stremioData.meta.director.join(', ')}
                </div>
              )}
              {stremioData.meta.writer && (
                <div className="info-item">
                  <strong>Writer:</strong> {stremioData.meta.writer.join(', ')}
                </div>
              )}
              {stremioData.meta.country && (
                <div className="info-item">
                  <strong>Country:</strong> {stremioData.meta.country}
                </div>
              )}
              {stremioData.meta.language && (
                <div className="info-item">
                  <strong>Language:</strong> {stremioData.meta.language}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Similar Content */}
        {tmdbData.similar && tmdbData.similar.results && tmdbData.similar.results.length > 0 && (
          <section className="detail-section">
            <h2>Similar {type === 'movie' ? 'Movies' : 'Shows'}</h2>
            <div className="similar-content">
              {tmdbData.similar.results.slice(0, 6).map(item => (
                <div 
                  key={item.id} 
                  className="similar-item"
                  onClick={() => navigate(`/detail/${type}/${item.id}`)}
                >
                  <img 
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/placeholder-poster.jpg'}
                    alt={item.title || item.name}
                  />
                  <div className="similar-title">{item.title || item.name}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Detail;