const express = require('express');
const router = express.Router();
const stremioController = require('../controllers/stremio');

router.get('/manifest.json', stremioController.getManifest);
router.get('/catalog/:type/:id.json', stremioController.getCatalog);
router.get('/meta/:type/:id.json', stremioController.getMeta);
router.get('/stream/:type/:id.json', stremioController.getStream);

module.exports = router;