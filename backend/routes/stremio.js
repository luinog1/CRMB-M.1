const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/stremio/manifest - Proxy manifest requests to addon URLs
router.get('/manifest', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    console.log(`🔍 Proxying manifest request to: ${url}`);
    
    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Fetch the manifest from the addon URL
    const manifestResponse = await axios.get(`${url}/manifest.json`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'CRMB/1.0'
      }
    });

    console.log('✅ Manifest fetched successfully');
    
    // Return the manifest data
    res.json(manifestResponse.data);
    
  } catch (error) {
    console.error('❌ Error fetching manifest:', error.message);
    
    if (error.response) {
      // The addon server responded with an error status
      res.status(error.response.status).json({
        success: false,
        error: `Addon server returned ${error.response.status}: ${error.response.statusText}`
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(504).json({
        success: false,
        error: 'Request timeout - addon server did not respond'
      });
    } else {
      // Something else happened in setting up the request
      res.status(500).json({
        success: false,
        error: `Failed to fetch manifest: ${error.message}`
      });
    }
  }
});

// GET /api/stremio/addons/available - Get all available addons from configuration
router.get('/addons/available', (req, res) => {
  try {
    const addonClient = require('../services/addonClient');
    const availableAddons = addonClient.getAvailableAddons();
    
    console.log(`🔍 Returning ${availableAddons.length} available addons`);
    
    res.json({
      success: true,
      addons: availableAddons
    });
    
  } catch (error) {
    console.error('❌ Error getting available addons:', error.message);
    res.status(500).json({
      success: false,
      error: `Failed to get available addons: ${error.message}`
    });
  }
});

module.exports = router;