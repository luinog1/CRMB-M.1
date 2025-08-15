import React from 'react';
import { useApp } from '../context/AppContext';
import ApiService from '../services/api';

const Header = () => {
  const { searchQuery, setSearchQuery, activeTab, setActiveTab } = useApp();

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        console.log('Searching for:', searchQuery.trim());
        // Test backend connectivity with health check first
        const healthCheck = await ApiService.checkHealth();
        console.log('Backend health:', healthCheck);
        
        // Attempt to search
        try {
          const searchResults = await ApiService.searchContent(searchQuery.trim());
          console.log('Search results:', searchResults);
          // Navigate to search results page (would be implemented in a real app)
          // For now, we'll just update the active tab
          if (activeTab !== 'search') {
            setActiveTab('search');
          }
        } catch (searchError) {
          console.error('Search failed:', searchError.message);
          alert('Search failed: ' + searchError.message);
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
        alert('Backend connection failed. Please check your connection and try again.');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getPageTitle = () => {
    switch(activeTab) {
      case 'home':
        return 'Discover';
      case 'library':
        return 'My Library';
      case 'settings':
        return 'Settings';
      default:
        return 'CRUMBLE';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="search-container">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <svg className="search-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search movies, TV shows..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      <div className="user-actions">
        <button className="action-btn" title="Notifications">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </button>
        
        <button className="action-btn" title="Downloads">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        
        <button className="action-btn profile-btn" title="Profile">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;