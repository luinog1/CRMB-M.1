const express = require('express');
const router = express.Router();
const axios = require('axios');

// Stremio add-on configuration
const CINEMETA_ADDON_URL = 'https://v3-cinemeta.strem.io';
const DEFAULT_ADDONS = [
  {
    id: 'cinemeta',
    name: 'Cinemeta',
    url: CINEMETA_ADDON_URL,
    description: 'Official Stremio metadata addon'
  }
];

// Configure axios with timeout and retry logic
const axiosConfig = {
  timeout: 10000,
  headers: {
    'User-Agent': 'CRMB-M.1/1.0.0'
  }
};

// Stremio API routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Stremio API route base',
    availableAddons: DEFAULT_ADDONS
  });
});

// Get available add-ons
router.get('/addons', async (req, res) => {
  try {
    // Return default addons for now, can be extended to fetch from repository
    res.status(200).json({
      addons: DEFAULT_ADDONS
    });
  } catch (error) {
    console.error('Stremio add-ons error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch Stremio add-ons' });
  }
});

// Get add-on manifest
router.get('/addon/:addonId/manifest', async (req, res) => {
  const { addonId } = req.params;
  
  try {
    let addonUrl = CINEMETA_ADDON_URL;
    if (addonId !== 'cinemeta') {
      // Handle other addons if needed
      return res.status(404).json({ message: 'Addon not found' });
    }
    
    const response = await axios.get(`${addonUrl}/manifest.json`, axiosConfig);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio add-on manifest error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch add-on manifest' });
  }
});

// Get catalog from add-on
router.get('/addon/:addonId/catalog/:type/:catalogId', async (req, res) => {
  const { addonId, type, catalogId } = req.params;
  const { skip, limit, genre, search } = req.query;
  
  try {
    let addonUrl = CINEMETA_ADDON_URL;
    if (addonId !== 'cinemeta') {
      return res.status(404).json({ message: 'Addon not found' });
    }
    
    let url = `${addonUrl}/catalog/${type}/${catalogId}.json`;
    const queryParams = [];
    
    if (skip) queryParams.push(`skip=${skip}`);
    if (limit) queryParams.push(`limit=${limit}`);
    if (genre) queryParams.push(`genre=${genre}`);
    if (search) queryParams.push(`search=${search}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await axios.get(url, axiosConfig);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio catalog error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch catalog' });
  }
});

// Get metadata from add-on
router.get('/addon/:addonId/meta/:type/:metaId', async (req, res) => {
  const { addonId, type, metaId } = req.params;
  
  try {
    let addonUrl = CINEMETA_ADDON_URL;
    if (addonId !== 'cinemeta') {
      return res.status(404).json({ message: 'Addon not found' });
    }
    
    const response = await axios.get(`${addonUrl}/meta/${type}/${metaId}.json`, axiosConfig);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio metadata error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata' });
  }
});

// Get metadata by IMDB ID (convenience endpoint)
router.get('/meta/:type/:imdbId', async (req, res) => {
  const { type, imdbId } = req.params;
  
  try {
    const response = await axios.get(`${CINEMETA_ADDON_URL}/meta/${type}/${imdbId}.json`, axiosConfig);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio metadata error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata' });
  }
});

// Get metadata by TMDB ID (converts to IMDB ID first)
router.get('/meta-by-tmdb/:type/:tmdbId', async (req, res) => {
  const { type, tmdbId } = req.params;
  const tmdbApiKey = req.headers['x-tmdb-api-key'];
  
  // Test mapping for demo purposes (when TMDB API is not available)
  const testMappings = {
    '27205': 'tt1375666', // Inception
    '157336': 'tt0816692', // Interstellar
    '603': 'tt0133093', // The Matrix
    '680': 'tt0110912', // Pulp Fiction
    '550': 'tt0137523', // Fight Club
    '155': 'tt0468569' // The Dark Knight
  };
  
  // If we have a test mapping, use it directly
  if (testMappings[tmdbId]) {
    try {
      const metaResponse = await axios.get(`${CINEMETA_ADDON_URL}/meta/${type}/${testMappings[tmdbId]}.json`, axiosConfig);
      return res.status(200).json(metaResponse.data);
    } catch (error) {
      console.error('Stremio metadata error:', error.response?.data || error.message);
      return res.status(500).json({ message: 'Failed to fetch metadata from Stremio' });
    }
  }
  
  if (!tmdbApiKey) {
    return res.status(401).json({ message: 'TMDB API key required for non-test content' });
  }
  
  try {
    // First get IMDB ID from TMDB
    const tmdbType = type === 'movie' ? 'movie' : 'tv';
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}/external_ids?api_key=${tmdbApiKey}`,
      axiosConfig
    );
    
    const imdbId = tmdbResponse.data.imdb_id;
    if (!imdbId) {
      return res.status(404).json({ message: 'IMDB ID not found for this TMDB ID' });
    }
    
    // Then get metadata from Cinemeta using IMDB ID
    const metaResponse = await axios.get(`${CINEMETA_ADDON_URL}/meta/${type}/${imdbId}.json`, axiosConfig);
    res.status(200).json(metaResponse.data);
  } catch (error) {
    console.error('Stremio metadata by TMDB ID error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata by TMDB ID' });
  }
});

// Get streaming sources from add-on
router.get('/sources/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { addons } = req.query;
  
  if (!addons) {
    return res.status(400).json({ message: 'Add-on URLs are required' });
  }
  
  try {
    // Parse add-ons from query parameter (comma-separated list)
    const addonUrls = addons.split(',');
    const streamPromises = addonUrls.map(addonUrl => {
      return axios.get(`${addonUrl}/stream/${type}/${id}.json`)
        .then(response => ({
          addon: addonUrl,
          streams: response.data.streams || []
        }))
        .catch(error => ({
          addon: addonUrl,
          error: error.message,
          streams: []
        }));
    });
    
    const results = await Promise.all(streamPromises);
    
    // Combine all streams from different add-ons
    const allStreams = results.reduce((acc, result) => {
      if (result.streams && result.streams.length > 0) {
        // Add add-on source to each stream
        const streamsWithSource = result.streams.map(stream => ({
          ...stream,
          addonSource: result.addon
        }));
        return [...acc, ...streamsWithSource];
      }
      return acc;
    }, []);
    
    res.status(200).json({ streams: allStreams });
  } catch (error) {
    console.error('Stremio streaming sources error:', error.message);
    res.status(500).json({ message: 'Failed to fetch streaming sources' });
  }
});

// Install add-on
router.post('/install-addon', async (req, res) => {
  const { addonUrl } = req.body;
  
  if (!addonUrl) {
    return res.status(400).json({ message: 'Add-on URL is required' });
  }
  
  try {
    // Fetch the add-on manifest to verify it's a valid Stremio add-on
    const response = await axios.get(`${addonUrl}/manifest.json`);
    
    // Here you would typically store the add-on in a database
    // For now, we'll just return the manifest
    res.status(200).json({
      message: 'Add-on installed successfully',
      addon: response.data
    });
  } catch (error) {
    console.error('Stremio add-on installation error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to install add-on' });
  }
});

// External player integration
router.post('/external-player', (req, res) => {
  const { streamUrl, playerType } = req.body;
  
  if (!streamUrl || !playerType) {
    return res.status(400).json({ message: 'Stream URL and player type are required' });
  }
  
  // In a real implementation, this would launch the external player
  // For now, we'll just return the stream URL and player type
  res.status(200).json({
    message: 'External player request received',
    streamUrl,
    playerType
  });
});

module.exports = router;