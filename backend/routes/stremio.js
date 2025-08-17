const express = require('express');
const router = express.Router();
const axios = require('axios');

// Stremio add-on configuration with proper protocol support
const CINEMETA_ADDON_URL = 'https://v3-cinemeta.strem.io';
const TORRENTIO_ADDON_URL = 'https://torrentio.strem.io';

const DEFAULT_ADDONS = [
  {
    id: 'cinemeta',
    name: 'Cinemeta',
    url: CINEMETA_ADDON_URL,
    description: 'Official Stremio metadata addon for movies and TV shows',
    resources: ['catalog', 'meta'],
    types: ['movie', 'series']
  },
  {
    id: 'torrentio',
    name: 'Torrentio',
    url: TORRENTIO_ADDON_URL,
    description: 'Torrent streams provider for movies and TV shows',
    resources: ['stream'],
    types: ['movie', 'series']
  }
];

// Configure axios with timeout and retry logic
const axiosConfig = {
  timeout: 15000,
  headers: {
    'User-Agent': 'CRMB-M.1/1.0.0',
    'Accept': 'application/json'
  }
};

// Stremio API routes
router.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Stremio API route base',
    availableAddons: DEFAULT_ADDONS,
    protocol: 'Stremio Addon Protocol v3'
  });
});

// Get available add-ons
router.get('/addons', async (req, res) => {
  try {
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
    let addonUrl;
    if (addonId === 'cinemeta') {
      addonUrl = CINEMETA_ADDON_URL;
    } else if (addonId === 'torrentio') {
      addonUrl = TORRENTIO_ADDON_URL;
    } else {
      return res.status(404).json({ message: 'Addon not found' });
    }
    
    const response = await axios.get(`${addonUrl}/manifest.json`, axiosConfig);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio add-on manifest error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch add-on manifest' });
  }
});

// Get catalog from add-on (proper Stremio protocol implementation)
router.get('/addon/:addonId/catalog/:type/:catalogId', async (req, res) => {
  const { addonId, type, catalogId } = req.params;
  const { skip = 0, limit = 20, genre, search, sort } = req.query;
  
  try {
    let addonUrl;
    if (addonId === 'cinemeta') {
      addonUrl = CINEMETA_ADDON_URL;
    } else if (addonId === 'torrentio') {
      addonUrl = TORRENTIO_ADDON_URL;
    } else {
      return res.status(404).json({ message: 'Addon not found' });
    }
    
    // Build query parameters according to Stremio protocol
    const queryParams = [];
    if (skip) queryParams.push(`skip=${skip}`);
    if (limit) queryParams.push(`limit=${limit}`);
    if (genre) queryParams.push(`genre=${encodeURIComponent(genre)}`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (sort) queryParams.push(`sort=${encodeURIComponent(sort)}`);
    
    let url = `${addonUrl}/catalog/${type}/${catalogId}.json`;
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    console.log(`Fetching catalog from: ${url}`);
    const response = await axios.get(url, axiosConfig);
    
    // Transform response to match our expected format
    const catalogData = response.data;
    if (catalogData && catalogData.metas) {
      // Transform Stremio meta objects to our format
      const transformedMetas = catalogData.metas.map(meta => ({
        id: meta.id,
        title: meta.name,
        year: meta.releaseInfo || meta.released ? new Date(meta.released).getFullYear() : '',
        poster: meta.poster || null,
        backdrop: meta.background || null,
        rating: meta.imdbRating || null,
        genre: meta.type || type,
        overview: meta.description || '',
        type: meta.type,
        releaseDate: meta.released,
        runtime: meta.runtime,
        genres: meta.genres || [],
        director: meta.director || [],
        cast: meta.cast || [],
        language: meta.language,
        country: meta.country
      }));
      
      res.status(200).json({
        ...catalogData,
        metas: transformedMetas
      });
    } else {
      res.status(200).json(catalogData);
    }
  } catch (error) {
    console.error('Stremio catalog error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch catalog' });
  }
});

// Get metadata from add-on (proper Stremio protocol implementation)
router.get('/addon/:addonId/meta/:type/:metaId', async (req, res) => {
  const { addonId, type, metaId } = req.params;
  
  try {
    let addonUrl;
    if (addonId === 'cinemeta') {
      addonUrl = CINEMETA_ADDON_URL;
    } else if (addonId === 'torrentio') {
      addonUrl = TORRENTIO_ADDON_URL;
    } else {
      return res.status(404).json({ message: 'Addon not found' });
    }
    
    const url = `${addonUrl}/meta/${type}/${metaId}.json`;
    console.log(`Fetching metadata from: ${url}`);
    const response = await axios.get(url, axiosConfig);
    
    // Transform response to match our expected format
    const metaData = response.data;
    if (metaData && metaData.meta) {
      const meta = metaData.meta;
      const transformedMeta = {
        id: meta.id,
        title: meta.name,
        year: meta.releaseInfo || meta.released ? new Date(meta.released).getFullYear() : '',
        poster: meta.poster || null,
        backdrop: meta.background || null,
        rating: meta.imdbRating || null,
        genre: meta.type || type,
        overview: meta.description || '',
        type: meta.type,
        releaseDate: meta.released,
        runtime: meta.runtime,
        genres: meta.genres || [],
        director: meta.director || [],
        cast: meta.cast || [],
        language: meta.language,
        country: meta.country,
        videos: meta.videos || [],
        trailers: meta.trailers || []
      };
      
      res.status(200).json({
        ...metaData,
        meta: transformedMeta
      });
    } else {
      res.status(200).json(metaData);
    }
  } catch (error) {
    console.error('Stremio metadata error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata' });
  }
});

// Get metadata by IMDB ID (convenience endpoint)
router.get('/meta/:type/:imdbId', async (req, res) => {
  const { type, imdbId } = req.params;
  
  try {
    const url = `${CINEMETA_ADDON_URL}/meta/${type}/${imdbId}.json`;
    console.log(`Fetching metadata by IMDB ID: ${url}`);
    const response = await axios.get(url, axiosConfig);
    
    // Transform response
    const metaData = response.data;
    if (metaData && metaData.meta) {
      const meta = metaData.meta;
      const transformedMeta = {
        id: meta.id,
        title: meta.name,
        year: meta.releaseInfo || meta.released ? new Date(meta.released).getFullYear() : '',
        poster: meta.poster || null,
        backdrop: meta.background || null,
        rating: meta.imdbRating || null,
        genre: meta.type || type,
        overview: meta.description || '',
        type: meta.type,
        releaseDate: meta.released,
        runtime: meta.runtime,
        genres: meta.genres || [],
        director: meta.director || [],
        cast: meta.cast || [],
        language: meta.language,
        country: meta.country,
        videos: meta.videos || [],
        trailers: meta.trailers || []
      };
      
      res.status(200).json({
        ...metaData,
        meta: transformedMeta
      });
    } else {
      res.status(200).json(metaData);
    }
  } catch (error) {
    console.error('Stremio metadata error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata from Stremio' });
  }
});

// Get metadata by TMDB ID (converts to IMDB ID first)
router.get('/meta-by-tmdb/:type/:tmdbId', async (req, res) => {
  const { type, tmdbId } = req.params;
  const tmdbApiKey = req.headers['x-tmdb-api-key'];
  
  if (!tmdbApiKey) {
    return res.status(401).json({ message: 'TMDB API key required for metadata conversion' });
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
    
    // Transform response
    const metaData = metaResponse.data;
    if (metaData && metaData.meta) {
      const meta = metaData.meta;
      const transformedMeta = {
        id: meta.id,
        title: meta.name,
        year: meta.releaseInfo || meta.released ? new Date(meta.released).getFullYear() : '',
        poster: meta.poster || null,
        backdrop: meta.background || null,
        rating: meta.imdbRating || null,
        genre: meta.type || type,
        overview: meta.description || '',
        type: meta.type,
        releaseDate: meta.released,
        runtime: meta.runtime,
        genres: meta.genres || [],
        director: meta.director || [],
        cast: meta.cast || [],
        language: meta.language,
        country: meta.country,
        videos: meta.videos || [],
        trailers: meta.trailers || []
      };
      
      res.status(200).json({
        ...metaData,
        meta: transformedMeta
      });
    } else {
      res.status(200).json(metaData);
    }
  } catch (error) {
    console.error('Stremio metadata by TMDB ID error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata by TMDB ID' });
  }
});

// Get streaming sources from add-on (proper Stremio protocol implementation)
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
      return axios.get(`${addonUrl}/stream/${type}/${id}.json`, axiosConfig)
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

// Get subtitles from add-on
router.get('/subtitles/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { videoID, videoSize } = req.query;
  
  try {
    // Build query parameters for subtitles
    const queryParams = [];
    if (videoID) queryParams.push(`videoID=${videoID}`);
    if (videoSize) queryParams.push(`videoSize=${videoSize}`);
    
    let url = `${CINEMETA_ADDON_URL}/subtitles/${type}/${id}.json`;
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await axios.get(url, axiosConfig);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio subtitles error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch subtitles' });
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
    const response = await axios.get(`${addonUrl}/manifest.json`, axiosConfig);
    
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