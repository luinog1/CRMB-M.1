import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Header = () => {
  const { activeTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Home';
      case 'library':
        return 'My Library';
      case 'search':
        return 'Search';
      case 'settings':
        return 'Settings';
      default:
        return 'CRUMBLE';
    }
  };

  return (
    <div className="header">
      {/* Search Bar */}
      <div className="search-bar">
        <svg className="search-icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search movies, shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Download Icon */}
        <div className="header-icon" title="Downloads">
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>

        {/* User Profile Icon */}
        <div className="header-icon" title="User Profile">
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Header;