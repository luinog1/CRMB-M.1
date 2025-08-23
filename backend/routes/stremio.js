const express = require('express');
const router = express.Router();
const stremioController = require('../controllers/stremio');

// API endpoints for Stremio addon data
router.get('/catalog/:type/:id', stremioController.getCatalog);
router.get('/meta/:type/:id', stremioController.getMeta);
router.get('/stream/:type/:id', stremioController.getStream);

// Addon management endpoints
router.get('/addons', stremioController.getAddons);
router.post('/install-addon', stremioController.installAddon);
router.get('/addons/available', stremioController.getAvailableAddons);

module.exports = router;