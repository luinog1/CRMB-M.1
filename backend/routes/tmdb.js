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
router.get('/movie/:id', async (req, res) => {
  const { id } = req.params;
  const { appendToResponse } = req.query;
  const apiKey = req.headers['x-tmdb-api-key'];
  
  // Test data for demo purposes
  const testMovies = {
    '27205': {
      id: 27205,
      title: 'Inception',
      overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      release_date: '2010-07-16',
      poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      vote_average: 8.8,
      runtime: 148,
      genres: [
        { id: 28, name: 'Action' },
        { id: 878, name: 'Science Fiction' },
        { id: 53, name: 'Thriller' }
      ],
      credits: {
        cast: [
          { id: 6193, name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
          { id: 3291, name: 'Marion Cotillard', character: 'Mal', profile_path: '/2dJq2NXKhKAGHlqbOqPBbGDLnNK.jpg' },
          { id: 24045, name: 'Tom Hardy', character: 'Eames', profile_path: '/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg' }
        ]
      },
      similar: {
        results: [
          { id: 157336, title: 'Interstellar', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
          { id: 603, title: 'The Matrix', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' }
        ]
      }
    },
    '157336': {
      id: 157336,
      title: 'Interstellar',
      overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
      release_date: '2014-11-07',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop_path: '/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
      vote_average: 8.6,
      runtime: 169,
      genres: [
        { id: 12, name: 'Adventure' },
        { id: 18, name: 'Drama' },
        { id: 878, name: 'Science Fiction' }
      ],
      credits: {
        cast: [
          { id: 1892, name: 'Matthew McConaughey', character: 'Cooper', profile_path: '/sY2mwpafcwqyYS1sOySu1MENDse.jpg' },
          { id: 1813, name: 'Anne Hathaway', character: 'Brand', profile_path: '/di6Cp0Ke0eRvHVjzSzuTaUT4e9V.jpg' }
        ]
      },
      similar: {
        results: [
          { id: 27205, title: 'Inception', poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
          { id: 603, title: 'The Matrix', poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' }
        ]
      }
    },
    '603': {
      id: 603,
      title: 'The Matrix',
      overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      release_date: '1999-03-30',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
      vote_average: 8.7,
      runtime: 136,
      genres: [
        { id: 28, name: 'Action' },
        { id: 878, name: 'Science Fiction' }
      ],
      credits: {
        cast: [
          { id: 6384, name: 'Keanu Reeves', character: 'Neo', profile_path: '/4D0PpNI0kmP58hgrwGC3wCjxhnm.jpg' },
          { id: 2975, name: 'Laurence Fishburne', character: 'Morpheus', profile_path: '/8Lh8hYXcWBHnvVg4aXAIGnwWJgE.jpg' }
        ]
      },
      similar: {
        results: [
          { id: 27205, title: 'Inception', poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
          { id: 157336, title: 'Interstellar', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' }
        ]
      }
    }
  };
  
  // If we have test data, return it
  if (testMovies[id]) {
    return res.status(200).json(testMovies[id]);
  }
  
  if (!apiKey) {
    return res.status(401).json({ message: 'TMDB API key required for non-test content' });
  }
  
  try {
    let url = `${TMDB_API_URL}/movie/${id}?api_key=${apiKey}`;
    
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