import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">
      <div className="hero-banner">
        <h1>CRUMBLE</h1>
        <p>Your minimalist media aggregator</p>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search for movies, TV shows, and more..."
            className="search-input"
          />
          <Link to="/search" className="search-button">Search</Link>
        </div>
      </div>

      <section className="content-section">
        <h2>Trending</h2>
        <div className="carousel">
          <p>Trending content will appear here</p>
        </div>
      </section>

      <section className="content-section">
        <h2>New Releases</h2>
        <div className="carousel">
          <p>New releases will appear here</p>
        </div>
      </section>
    </div>
  );
}

export default Home;