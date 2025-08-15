import React from 'react';
import { useApp } from '../context/AppContext';
import MovieCard from '../components/MovieCard';

const LibraryPage = () => {
  const { libraryTab, setLibraryTab } = useApp();

  const libraryTabs = ['All', 'Movies', 'TV Shows', 'Watchlist'];

  // Mock library data
  const libraryItems = [
    {
      id: 1,
      title: "Breaking Bad",
      year: "2008",
      genre: "Crime, Drama",
      rating: "9.5",
      added: "2 days ago",
      type: "tv"
    },
    {
      id: 2,
      title: "The Godfather",
      year: "1972",
      genre: "Crime, Drama",
      rating: "9.2",
      added: "1 week ago",
      type: "movie"
    },
    {
      id: 3,
      title: "Stranger Things",
      year: "2016",
      genre: "Drama, Fantasy",
      rating: "8.7",
      added: "3 days ago",
      type: "tv"
    },
    {
      id: 4,
      title: "Inception",
      year: "2010",
      genre: "Sci-Fi, Thriller",
      rating: "8.8",
      added: "5 days ago",
      type: "movie"
    }
  ];

  const getFilteredItems = () => {
    switch(libraryTab) {
      case 'Movies':
        return libraryItems.filter(item => item.type === 'movie');
      case 'TV Shows':
        return libraryItems.filter(item => item.type === 'tv');
      case 'Watchlist':
        return libraryItems.slice(0, 2); // Mock watchlist
      default:
        return libraryItems;
    }
  };

  const getStats = () => {
    const movies = libraryItems.filter(item => item.type === 'movie').length;
    const tvShows = libraryItems.filter(item => item.type === 'tv').length;
    const total = libraryItems.length;
    
    return { movies, tvShows, total };
  };

  const stats = getStats();
  const filteredItems = getFilteredItems();

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="library-stats">
          <div className="stat-item">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.movies}</div>
            <div className="stat-label">Movies</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.tvShows}</div>
            <div className="stat-label">TV Shows</div>
          </div>
        </div>

        <div className="library-actions">
          <button className="btn btn-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
            Sort
          </button>
          <button className="btn btn-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      <div className="library-nav">
        {libraryTabs.map(tab => (
          <button
            key={tab}
            className={`library-tab ${libraryTab === tab ? 'active' : ''}`}
            onClick={() => setLibraryTab(tab)}
          >
            {tab}
            {tab === 'Watchlist' && (
              <span className="tab-count">2</span>
            )}
          </button>
        ))}
      </div>

      <div className="library-content">
        {filteredItems.length > 0 ? (
          <div className="library-grid">
            {filteredItems.map(item => (
              <MovieCard key={item.id} movie={item} variant="library" />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
              </svg>
            </div>
            <h3 className="empty-title">No items in {libraryTab.toLowerCase()}</h3>
            <p className="empty-description">
              {libraryTab === 'Watchlist' 
                ? 'Add movies and TV shows to your watchlist to see them here.'
                : `You haven't added any ${libraryTab.toLowerCase()} to your library yet.`
              }
            </p>
            <button className="btn btn-primary">
              Browse Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;