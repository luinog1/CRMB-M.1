const express = require('express');
const router = express.Router();
const axios = require('axios');

// Stremio add-on configuration
const STREMIO_ADDON_REPOSITORY = 'https://stremio-addons.herokuapp.com/addons';

// Stremio API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Stremio API route base' });
});

// Get available add-ons
router.get('/addons', async (req, res) => {
  try {
    const response = await axios.get(STREMIO_ADDON_REPOSITORY);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio add-ons error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch Stremio add-ons' });
  }
});

// Get add-on manifest
router.get('/addon/:id/manifest', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.get(`${id}/manifest.json`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio add-on manifest error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch add-on manifest' });
  }
});

// Get catalog from add-on
router.get('/addon/:id/catalog/:type/:catalogId', async (req, res) => {
  const { id, type, catalogId } = req.params;
  const { skip, limit, genre, search } = req.query;
  
  try {
    let url = `${id}/catalog/${type}/${catalogId}.json`;
    const queryParams = [];
    
    if (skip) queryParams.push(`skip=${skip}`);
    if (limit) queryParams.push(`limit=${limit}`);
    if (genre) queryParams.push(`genre=${genre}`);
    if (search) queryParams.push(`search=${search}`);
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio catalog error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch catalog' });
  }
});

// Get metadata from add-on
router.get('/addon/:id/meta/:type/:metaId', async (req, res) => {
  const { id, type, metaId } = req.params;
  
  try {
    const response = await axios.get(`${id}/meta/${type}/${metaId}.json`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Stremio metadata error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch metadata' });
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