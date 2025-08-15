const express = require('express');
const router = express.Router();
const axios = require('axios');

// TMDB API configuration
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Middleware to check for TMDB API key
const requireTmdbApiKey = (req, res, next) => {
  const apiKey = req.headers['x-tmdb-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'TMDB API key required' });
  }
  
  req.tmdbApiKey = apiKey;
  next();
};

// TMDB API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'TMDB API route base' });
});

// Get trending content
router.get('/trending', requireTmdbApiKey, async (req, res) => {
  const { mediaType = 'all', timeWindow = 'week' } = req.query;
  
  try {
    const response = await axios.get(
      `${TMDB_API_URL}/trending/${mediaType}/${timeWindow}?api_key=${req.tmdbApiKey}`
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB trending error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch trending content' });
  }
});

// Get new releases (movies now playing)
router.get('/new-releases', requireTmdbApiKey, async (req, res) => {
  const { page = 1, region } = req.query;
  const regionParam = region ? `&region=${region}` : '';
  
  try {
    const response = await axios.get(
      `${TMDB_API_URL}/movie/now_playing?api_key=${req.tmdbApiKey}&page=${page}${regionParam}`
    );
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB new releases error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch new releases' });
  }
});

// Search for movies, TV shows, or people
router.get('/search', requireTmdbApiKey, async (req, res) => {
  const { query, type = 'multi', page = 1, includeAdult = false, region, year, language } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  
  try {
    let url = `${TMDB_API_URL}/search/${type}?api_key=${req.tmdbApiKey}&query=${encodeURIComponent(query)}&page=${page}&include_adult=${includeAdult}`;
    
    if (region) url += `&region=${region}`;
    if (year) url += `&year=${year}`;
    if (language) url += `&language=${language}`;
    
    const response = await axios.get(url);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB search error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to search content' });
  }
});

// Get movie details
router.get('/movie/:id', requireTmdbApiKey, async (req, res) => {
  const { id } = req.params;
  const { appendToResponse } = req.query;
  
  try {
    let url = `${TMDB_API_URL}/movie/${id}?api_key=${req.tmdbApiKey}`;
    
    if (appendToResponse) {
      url += `&append_to_response=${appendToResponse}`;
    }
    
    const response = await axios.get(url);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB movie details error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch movie details' });
  }
});

// Get TV show details
router.get('/tv/:id', requireTmdbApiKey, async (req, res) => {
  const { id } = req.params;
  const { appendToResponse } = req.query;
  
  try {
    let url = `${TMDB_API_URL}/tv/${id}?api_key=${req.tmdbApiKey}`;
    
    if (appendToResponse) {
      url += `&append_to_response=${appendToResponse}`;
    }
    
    const response = await axios.get(url);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB TV details error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch TV details' });
  }
});

// Get person details
router.get('/person/:id', requireTmdbApiKey, async (req, res) => {
  const { id } = req.params;
  const { appendToResponse } = req.query;
  
  try {
    let url = `${TMDB_API_URL}/person/${id}?api_key=${req.tmdbApiKey}`;
    
    if (appendToResponse) {
      url += `&append_to_response=${appendToResponse}`;
    }
    
    const response = await axios.get(url);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB person details error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch person details' });
  }
});

// Discover movies
router.get('/discover/movie', requireTmdbApiKey, async (req, res) => {
  try {
    const queryParams = new URLSearchParams({
      api_key: req.tmdbApiKey,
      ...req.query
    });
    
    const response = await axios.get(`${TMDB_API_URL}/discover/movie?${queryParams}`);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB discover movies error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to discover movies' });
  }
});

// Discover TV shows
router.get('/discover/tv', requireTmdbApiKey, async (req, res) => {
  try {
    const queryParams = new URLSearchParams({
      api_key: req.tmdbApiKey,
      ...req.query
    });
    
    const response = await axios.get(`${TMDB_API_URL}/discover/tv?${queryParams}`);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('TMDB discover TV shows error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to discover TV shows' });
  }
});

module.exports = router;