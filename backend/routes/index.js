const express = require('express');
const router = express.Router();

// Import route modules
const tmdbRoutes = require('./tmdb');
const traktRoutes = require('./trakt');
const stremioRoutes = require('./stremio');
const mdblistRoutes = require('./mdblist');

// Register routes
router.use('/tmdb', tmdbRoutes);
router.use('/trakt', traktRoutes);
router.use('/stremio', stremioRoutes);
router.use('/mdblist', mdblistRoutes);

module.exports = router;