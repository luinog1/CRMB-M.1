const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content');

// Unified content discovery API endpoints

// GET /api/content/discover/:type/:category
// Discover content by type and category with standardized response format
router.get('/discover/:type/:category', contentController.getDiscoverContent);

// GET /api/content/addon/:addonId/:type/:id
// Get content from a specific addon with standardized response format and metadata
router.get('/addon/:addonId/:type/:id', contentController.getAddonContent);

// GET /api/content/search/:query
// Search across all addons with standardized response format and metadata
router.get('/search/:query', contentController.searchContent);

// GET /api/content/stream/:id
// Get streams for a specific item with standardized response format
router.get('/stream/:id', contentController.getStreamContent);

// GET /api/content/meta/:id
// Get metadata for a specific item with standardized response format
router.get('/meta/:id', contentController.getMetadataContent);

// Health check endpoint for the content API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Content API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/content/discover/:type/:category',
      'GET /api/content/addon/:addonId/:type/:id',
      'GET /api/content/search/:query',
      'GET /api/content/stream/:id',
      'GET /api/content/meta/:id'
    ]
  });
});

module.exports = router;