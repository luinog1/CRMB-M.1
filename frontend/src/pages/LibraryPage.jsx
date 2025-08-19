import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import ApiService from '../services/api';
import { useApp } from '../context/AppContext';

const LibraryPage = () => {
  const { settings } = useApp();
  const [libraryContent, setLibraryContent] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collection');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const loadLibraryContent = async () => {
      setIsLoading(true);
      
      console.group('🔍 LibraryPage Debug - Data Loading');
      console.log('📂 Starting library content load...');
      
      try {
        // Load library content from addons or local storage
        console.log('📦 Loading addons...');
        const addons = await ApiService.getAddons();
        console.log('✅ Addons loaded:', addons);
        console.log('📊 Addon count:', addons?.length || 0);
        
        if (addons && addons.length > 0) {
          console.log('🔄 Syncing with addons...');
          const syncedContent = await ApiService.syncAddons();
          console.log('📚 Synced content:', syncedContent);
          console.log('📊 Synced content count:', syncedContent?.length || 0);
          
          if (syncedContent && syncedContent.length > 0) {
            console.log('✅ Setting library content from sync');
            setLibraryContent(syncedContent);
          } else {
            console.log('⚠️ No content from addon sync, trying local storage...');
            // Fallback to local storage
            const userLibrary = await ApiService.getUserLibrary();
            console.log('📚 User library from local storage:', userLibrary);
            setLibraryContent(userLibrary || []);
          }
        } else {
          console.log('⚠️ No addons found, loading from local storage...');
          const userLibrary = await ApiService.getUserLibrary();
          console.log('📚 User library from local storage:', userLibrary);
          setLibraryContent(userLibrary || []);
        }

        // Load watchlist and favorites from local storage
        console.log('💾 Loading watchlist from localStorage...');
        const savedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        console.log('📋 Watchlist loaded:', savedWatchlist);
        console.log('📊 Watchlist count:', savedWatchlist.length);
        
        console.log('💾 Loading favorites from localStorage...');
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        console.log('⭐ Favorites loaded:', savedFavorites);
        console.log('📊 Favorites count:', savedFavorites.length);
        
        setWatchlist(savedWatchlist);
        setFavorites(savedFavorites);

        console.log('📊 Final state summary:');
        console.log('  - Library content:', libraryContent.length);
        console.log('  - Watchlist:', savedWatchlist.length);
        console.log('  - Favorites:', savedFavorites.length);
        console.log('  - Total items:', libraryContent.length + savedWatchlist.length + savedFavorites.length);

      } catch (error) {
        console.error('❌ Failed to load library content:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      } finally {
        console.groupEnd();
        setIsLoading(false);
      }
    };

    loadLibraryContent();
  }, []);

  const getTotalItems = () => {
    return libraryContent.length + watchlist.length + favorites.length;
  };

  const getEnabledAddons = () => {
    return settings.addons ? settings.addons.filter(addon => addon.enabled).length : 0;
  };

  const getDisabledAddons = () => {
    return settings.addons ? settings.addons.filter(addon => !addon.enabled).length : 0;
  };

  const handleContinueWatching = () => {
    // TODO: Implement continue watching functionality
    console.log('Continue watching clicked');
  };

  const handleViewAll = (type) => {
    setActiveTab(type);
  };

  const getCurrentContent = () => {
    console.group('📊 LibraryPage Debug - Content Selection');
    console.log('🎯 Active tab:', activeTab);
    console.log('📋 Watchlist items:', watchlist.length);
    console.log('⭐ Favorites items:', favorites.length);
    console.log('📚 Library content items:', libraryContent.length);
    
    let content;
    switch (activeTab) {
      case 'watchlist':
        content = watchlist;
        console.log('📋 Returning watchlist content:', content);
        break;
      case 'favorites':
        content = favorites;
        console.log('⭐ Returning favorites content:', content);
        break;
      default:
        content = libraryContent;
        console.log('📚 Returning library content:', content);
        break;
    }
    
    console.log('📊 Final content count:', content.length);
    console.groupEnd();
    return content;
  };

  const getCurrentContentCount = () => {
    switch (activeTab) {
      case 'watchlist':
        return watchlist.length;
      case 'favorites':
        return favorites.length;
      default:
        return libraryContent.length;
    }
  };

  if (isLoading) {
    return (
      <div className="content-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">My Library</h1>
        <p className="page-description">
          Manage your personal collection of movies and shows. Keep track of what you want to watch and save your favorites for easy access.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-secondary">
          Your Collection • {getTotalItems()} items
        </button>
        <button className="btn btn-primary" onClick={handleContinueWatching}>
          <svg className="btn-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Continue Watching
        </button>
      </div>

      {/* Content Categories */}
      <div style={{ marginBottom: '24px' }}>
        <button
          className={`btn ${activeTab === 'watchlist' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('watchlist')}
          style={{ marginRight: '16px' }}
        >
          Watchlist ({watchlist.length})
        </button>
        <button
          className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {/* Content Summary */}
      <div className="content-summary">
        <h3>Content Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-value">{getTotalItems()}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value stat-enabled">{getEnabledAddons()}</span>
            <span className="stat-label">Enabled Addons</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value stat-disabled">{getDisabledAddons()}</span>
            <span className="stat-label">Disabled Addons</span>
          </div>
        </div>
        <div className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Content Section */}
      <div className="addon-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>Recently Added</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('grid')}
              style={{ padding: '8px', minWidth: 'auto' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
              </svg>
            </button>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
              style={{ padding: '8px', minWidth: 'auto' }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </button>
          </div>
        </div>

        {(() => {
          const currentContent = getCurrentContent();
          console.group('🎬 LibraryPage Debug - Render Content');
          console.log('📊 Current content count:', currentContent.length);
          console.log('🎯 Active tab:', activeTab);
          console.log('📋 Content preview:', currentContent.slice(0, 3));
          
          if (currentContent.length > 0) {
            console.log('✅ Rendering content grid with', currentContent.length, 'items');
            console.groupEnd();
            return (
              <div className={`movie-grid ${viewMode === 'list' ? 'movie-list' : ''}`}>
                {currentContent.map((item, index) => {
                  console.log(`🎭 Rendering item ${index + 1}:`, {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    year: item.year
                  });
                  return (
                    <MovieCard
                      key={item.id}
                      movie={item}
                      variant={viewMode}
                    />
                  );
                })}
              </div>
            );
          } else {
            console.log('⚠️ No content found, rendering empty state');
            console.groupEnd();
            return (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <h3 className="empty-state-title">No {activeTab === 'watchlist' ? 'Watchlist' : activeTab === 'favorites' ? 'Favorites' : 'Collection'} Items</h3>
                <p className="empty-state-description">
                  {activeTab === 'watchlist'
                    ? 'Add movies and shows to your watchlist to keep track of what you want to watch.'
                    : activeTab === 'favorites'
                    ? 'Mark your favorite movies and shows to easily find them later.'
                    : 'Your collection is empty. Add some addons and sync them to start building your library.'
                  }
                </p>
                {activeTab === 'collection' && (
                  <button className="btn btn-primary" onClick={() => window.location.href = '/settings?tab=addon-manager'}>
                    Add First Addon
                  </button>
                )}
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default LibraryPage;
