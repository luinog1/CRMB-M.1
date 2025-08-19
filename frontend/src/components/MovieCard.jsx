import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, variant = 'default', onPlay, onMoreInfo }) => {
  const navigate = useNavigate();
  
  console.group('🎬 MovieCard Debug - Component Render');
  console.log('📋 Movie data received:', {
    id: movie?.id,
    title: movie?.title || movie?.name,
    type: movie?.type,
    year: movie?.year,
    hasPoster: !!movie?.poster,
    hasPosterPath: !!movie?.poster_path,
    variant: variant
  });
  console.groupEnd();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(movie);
    } else {
      console.log('Playing:', movie.title || movie.name);
      // TODO: Implement default play functionality
    }
  };

  const handleCardClick = () => {
    // Navigate to detail page with movie type and ID
    const type = movie.genre === 'tv' || movie.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${movie.id}`);
  };

  const handleMoreInfoClick = (e) => {
    e.stopPropagation();
    if (onMoreInfo) {
      onMoreInfo(movie);
    } else {
      console.log('More info for:', movie.title || movie.name);
      // TODO: Implement default more info functionality
    }
  };

  const getMovieYear = () => {
    if (movie.year) return movie.year;
    if (movie.release_date) return new Date(movie.release_date).getFullYear();
    if (movie.first_air_date) return new Date(movie.first_air_date).getFullYear();
    return '';
  };

  const getMovieGenres = () => {
    if (movie.genre) return movie.genre;
    if (movie.genres && movie.genres.length > 0) {
      return movie.genres.slice(0, 2).map(g => g.name || g).join(', ');
    }
    return '';
  };

  const getMovieRating = () => {
    if (movie.rating) return movie.rating;
    if (movie.vote_average) return movie.vote_average.toFixed(1);
    return '';
  };

  const getMoviePoster = () => {
    if (movie.poster) return movie.poster;
    if (movie.poster_path) return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    return null;
  };

  const getAddedDate = () => {
    if (movie.added) {
      const date = new Date(movie.added);
      return `Added ${date.toLocaleDateString()}`;
    }
    return '';
  };

  const movieYear = getMovieYear();
  const movieGenres = getMovieGenres();
  const movieRating = getMovieRating();
  const moviePoster = getMoviePoster();
  const addedDate = getAddedDate();

  if (variant === 'list') {
    return (
      <div className="movie-card movie-list-item" onClick={handleCardClick}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="movie-poster" style={{ width: '80px', height: '120px', flexShrink: 0 }}>
            {moviePoster ? (
              <img src={moviePoster} alt={movie.title || movie.name} />
            ) : (
              <div className="movie-poster-placeholder">
                <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 className="movie-title">{movie.title || movie.name}</h3>
            <p className="movie-meta">
              {movieYear && `${movieYear} • `}
              {movieGenres}
            </p>
            {addedDate && <p className="movie-added">{addedDate}</p>}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={handlePlayClick} style={{ padding: '8px 16px' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button className="btn btn-secondary" onClick={handleMoreInfoClick} style={{ padding: '8px 16px' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-card" onClick={handleCardClick}>
      <div className="movie-poster">
        {moviePoster ? (
          <img src={moviePoster} alt={movie.title || movie.name} />
        ) : (
          <div className="movie-poster-placeholder">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        )}
        
        {movieRating && (
          <div className="movie-rating">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {movieRating}
          </div>
        )}
      </div>
      
      <div className="movie-info">
        <h3 className="movie-title">{movie.title || movie.name}</h3>
        <p className="movie-meta">
          {movieYear && `${movieYear} • `}
          {movieGenres}
        </p>
        {addedDate && <p className="movie-added">{addedDate}</p>}
      </div>
    </div>
  );
};

export default MovieCard;