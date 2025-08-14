import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-logo">
        <Link to="/">CRUMBLE</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/search" className="nav-link">Search</Link>
        <Link to="/library" className="nav-link">Library</Link>
      </div>
    </nav>
  );
}

export default Navigation;