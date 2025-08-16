import React from 'react';
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie, variant = 'default' }) => {
  const navigate = useNavigate();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    // TODO: Implement play functionality
    console.log('Playing:', movie.title);
  };

  const handleCardClick = () => {
    // Navigate to detail page with movie type and ID
    const type = movie.genre === 'tv' || movie.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${movie.id}`);
  };

  if (variant === 'library') {
    return (
      <div className="library-card" onClick={handleCardClick}>
        <div className="library-card-image">
          <div className="card-overlay">
            <span>★</span>
            <span>{movie.rating}</span>
          </div>
          <button className="play-btn" onClick={handlePlayClick}>
            <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24" style={{color: '#ffffff'}}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
        <div className="library-card-info">
          <div className="library-card-title">{movie.title}</div>
          <div className="library-card-details">{movie.year} • {movie.genre}</div>
          <div className="library-card-added">Added {movie.added}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-card" onClick={handleCardClick}>
      <div className="movie-card-image">
        <img 
          src={movie.poster || `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${movie.title} movie poster`)}&image_size=portrait_4_3`}
          alt={movie.title}
          loading="lazy"
        />
        <div className="movie-card-overlay">
          <button className="play-btn" onClick={handlePlayClick}>
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <div className="movie-info">
            <div className="movie-rating">
              <span>★</span>
              <span>{movie.rating}</span>
            </div>
            <div className="movie-year">{movie.year}</div>
          </div>
        </div>
      </div>
      <div className="movie-card-content">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-genre">{movie.genre}</p>
      </div>
    </div>
  );
};

export default MovieCard;