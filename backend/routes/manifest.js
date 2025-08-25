const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/manifest/proxy - Proxy manifest requests to addon URLs
router.get('/proxy', async (req, res) => {
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

// GET /api/manifest/validate - Validate an addon URL and return manifest info
router.get('/validate', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    console.log(`🔍 Validating addon URL: ${url}`);
    
    // Validate and format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    try {
      new URL(formattedUrl);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Fetch the manifest from the addon URL
    const manifestResponse = await axios.get(`${formattedUrl}/manifest.json`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'CRMB/1.0'
      }
    });

    const manifest = manifestResponse.data;
    
    // Validate manifest structure
    const validation = {
      valid: true,
      url: formattedUrl,
      manifest: manifest,
      errors: [],
      warnings: []
    };

    // Check required fields
    if (!manifest.name) {
      validation.errors.push('Missing required field: name');
      validation.valid = false;
    }
    
    if (!manifest.resources) {
      validation.errors.push('Missing required field: resources');
      validation.valid = false;
    }
    
    if (!manifest.types) {
      validation.errors.push('Missing required field: types');
      validation.valid = false;
    }

    // Check for recommended fields
    if (!manifest.id) {
      validation.warnings.push('Recommended field missing: id');
    }
    
    if (!manifest.description) {
      validation.warnings.push('Recommended field missing: description');
    }

    console.log(validation.valid ? '✅ Addon validation successful' : '❌ Addon validation failed');
    
    res.json({
      success: true,
      validation: validation
    });
    
  } catch (error) {
    console.error('❌ Error validating addon:', error.message);
    
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
        error: `Failed to validate addon: ${error.message}`
      });
    }
  }
});

module.exports = router;