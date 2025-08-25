const express = require('express');
const router = express.Router();

// Import route modules
const tmdbRoutes = require('./tmdb');
const traktRoutes = require('./trakt');
const stremioRoutes = require('./stremio');
const contentRoutes = require('./content');
const addonRoutes = require('./addon');
const manifestRoutes = require('./manifest');
const mdblistRoutes = require('./mdblist');

// Direct test endpoint
router.get('/direct-test', (req, res) => {
  console.log('DIRECT TEST ENDPOINT HIT (API ROUTES)');
  res.status(200).json({ message: 'direct test response from api routes' });
});

// Register routes
router.use('/tmdb', tmdbRoutes);
router.use('/trakt', traktRoutes);
router.use('/stremio', stremioRoutes);
router.use('/content', contentRoutes);
router.use('/addons', addonRoutes);
router.use('/manifest', manifestRoutes);
router.use('/mdblist', mdblistRoutes);

module.exports = router;