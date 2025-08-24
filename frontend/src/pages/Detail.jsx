import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import { useApp } from '../context/AppContext';

function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { settings } = useApp();
  
  const [contentData, setContentData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching content data for:', { type, id });

        // Set API keys if available
        if (settings?.tmdbApiKey) {
          ApiService.setApiKey('tmdb', settings.tmdbApiKey);
        }

        // First, try to get metadata from the unified API
        let metadataResponse = null;
        try {
          console.log('🔍 Fetching metadata...');
          metadataResponse = await ApiService.getMetadata(id, type);
          console.log('📋 Metadata response:', metadataResponse);
          setMetadata(metadataResponse);
        } catch (metadataError) {
          console.warn('Failed to fetch unified metadata:', metadataError.message);
        }

        // Try to get streams from the unified API
        try {
          console.log('🔍 Fetching streams...');
          const streamsResponse = await ApiService.getStreams(id, type);
          console.log('📋 Streams response:', streamsResponse);
          setStreams(streamsResponse || []);
        } catch (streamsError) {
          console.warn('Failed to fetch streams:', streamsError.message);
          setStreams([]);
        }

        // Fallback to TMDB if unified API doesn't have data
        if (!metadataResponse) {
          try {
            console.log('🔍 Falling back to TMDB API...');
            let tmdbResponse;
            if (type === 'movie') {
              tmdbResponse = await ApiService.getMovieDetails(id);
            } else {
              tmdbResponse = await ApiService.getTvDetails(id);
            }
            console.log('📋 TMDB response:', tmdbResponse);

            // Normalize TMDB data to match our expected format
            const normalizedData = {
              id: tmdbResponse.id,
              title: tmdbResponse.title || tmdbResponse.name,
              overview: tmdbResponse.overview,
              poster_path: tmdbResponse.poster_path,
              backdrop_path: tmdbResponse.backdrop_path,
              vote_average: tmdbResponse.vote_average,
              release_date: tmdbResponse.release_date,
              first_air_date: tmdbResponse.first_air_date,
              runtime: tmdbResponse.runtime,
              episode_run_time: tmdbResponse.episode_run_time,
              genres: tmdbResponse.genres,
              credits: tmdbResponse.credits,
              similar: tmdbResponse.similar,
              type: type
            };

            setContentData(normalizedData);
          } catch (tmdbError) {
            console.warn('Failed to fetch TMDB data:', tmdbError.message);
            setError('Unable to load content details. Please try again later.');
          }
        } else {
          // Use the unified metadata
          setContentData(metadataResponse);
        }

      } catch (err) {
        console.error('Failed to fetch content data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (type && id) {
      fetchContentData();
    }
  }, [type, id, settings?.tmdbApiKey]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlay = () => {
    console.log('Playing:', contentData?.title || contentData?.name);

    // If we have streams from the unified API, try to play the first one
    if (streams && streams.length > 0) {
      const firstStream = streams[0];
      if (firstStream.url) {
        console.log('Opening stream:', firstStream.url);
        window.open(firstStream.url, '_blank');
        return;
      }
    }

    // TODO: Implement additional play functionality
  };

  const handleAddToLibrary = () => {
    console.log('Adding to library:', contentData?.title || contentData?.name);
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

  if (!contentData) {
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

  const title = contentData.title || contentData.name;
  const releaseDate = contentData.release_date || contentData.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const posterUrl = contentData.poster_path ? `https://image.tmdb.org/t/p/w500${contentData.poster_path}` : null;
  const backdropUrl = contentData.backdrop_path ? `https://image.tmdb.org/t/p/original${contentData.backdrop_path}` : null;
  const rating = contentData.vote_average ? contentData.vote_average.toFixed(1) : 'N/A';
  const runtime = contentData.runtime || (contentData.episode_run_time && contentData.episode_run_time[0]);
  const genres = contentData.genres ? contentData.genres.map(g => g.name).join(', ') : '';

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
            <p className="detail-overview">{contentData.overview}</p>
            
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
        {contentData.credits && contentData.credits.cast && contentData.credits.cast.length > 0 && (
          <section className="detail-section">
            <h2>Cast</h2>
            <div className="cast-list">
              {contentData.credits.cast.slice(0, 10).map(person => (
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

        {/* Additional Metadata */}
        {metadata && (
          <section className="detail-section">
            <h2>Additional Information</h2>
            <div className="stremio-info">
              {metadata.director && (
                <div className="info-item">
                  <strong>Director:</strong> {Array.isArray(metadata.director) ? metadata.director.join(', ') : metadata.director}
                </div>
              )}
              {metadata.writer && (
                <div className="info-item">
                  <strong>Writer:</strong> {Array.isArray(metadata.writer) ? metadata.writer.join(', ') : metadata.writer}
                </div>
              )}
              {metadata.country && (
                <div className="info-item">
                  <strong>Country:</strong> {metadata.country}
                </div>
              )}
              {metadata.language && (
                <div className="info-item">
                  <strong>Language:</strong> {metadata.language}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Streaming Sources */}
        {streams && streams.length > 0 && (
          <section className="detail-section">
            <h2>Streaming Sources</h2>
            <div className="streams-list">
              {streams.map((stream, index) => (
                <div key={index} className="stream-item">
                  <div className="stream-name">
                    {stream.name || stream.title || `Source ${index + 1}`}
                  </div>
                  <div className="stream-info">
                    {stream.title && <span className="stream-title">{stream.title}</span>}
                    {stream.quality && <span className="stream-quality">{stream.quality}</span>}
                  </div>
                  <button
                    className="btn btn-primary stream-button"
                    onClick={() => window.open(stream.url, '_blank')}
                  >
                    Watch
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Content */}
        {contentData.similar && contentData.similar.results && contentData.similar.results.length > 0 && (
          <section className="detail-section">
            <h2>Similar {type === 'movie' ? 'Movies' : 'Shows'}</h2>
            <div className="similar-content">
              {contentData.similar.results.slice(0, 6).map(item => (
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