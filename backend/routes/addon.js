/**
 * Addon Routes
 * This file defines the routes for the Stremio addon using the stremio-addon-sdk.
 */

const express = require('express');
const router = express.Router();
const AddonService = require('../services/addon');
const addonConfig = require('../config/addons');

// Create addon service
const addonService = new AddonService(addonConfig);
const addon = addonService.getAddon();

// Serve the manifest
router.get('/manifest.json', (req, res) => {
  console.log('📋 Serving manifest');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.send(addon.manifest);
});

// Serve catalog
router.get('/catalog/:type/:id.json', (req, res) => {
  console.log(`📋 Catalog request: ${req.params.type}/${req.params.id}`);
  addonService.getCatalog(req.params)
    .then(result => res.send(result))
    .catch(err => {
      console.error('❌ Error serving catalog:', err);
      res.status(500).send({ error: 'Internal server error' });
    });
});

// Serve metadata
router.get('/meta/:type/:id.json', (req, res) => {
  console.log(`📋 Meta request: ${req.params.type}/${req.params.id}`);
  addonService.getMeta(req.params)
    .then(result => res.send(result))
    .catch(err => {
      console.error('❌ Error serving metadata:', err);
      res.status(500).send({ error: 'Internal server error' });
    });
});

// Serve streams
router.get('/stream/:type/:id.json', (req, res) => {
  console.log(`📋 Stream request: ${req.params.type}/${req.params.id}`);
  addonService.getStreams(req.params)
    .then(result => res.send(result))
    .catch(err => {
      console.error('❌ Error serving streams:', err);
      res.status(500).send({ error: 'Internal server error' });
    });
});

// Additional API endpoints

// Get addons list
router.get('/addons', async (req, res) => {
  try {
    // Get configured addons from config
    const configAddons = addonConfig.addons.map(addon => ({
      id: addon.id,
      name: addon.name,
      url: addon.url,
      description: addon.description,
      resources: addon.resources,
      types: addon.types,
      enabled: addon.enabled
    }));
    
    // Get external addons from addon client
    const externalAddons = addonService.getExternalAddons();
    
    res.status(200).json({
      addons: configAddons,
      externalAddons: externalAddons
    });
  } catch (error) {
    console.error('❌ Error fetching addons:', error);
    res.status(500).json({ message: 'Failed to fetch Stremio add-ons', error: error.message });
  }
});

// Add external addon
router.post('/addons', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    const addon = await addonService.addExternalAddon(url);
    
    if (addon) {
      res.status(201).json({
        message: 'Addon added successfully',
        addon
      });
    } else {
      res.status(400).json({ message: 'Failed to add addon' });
    }
  } catch (error) {
    console.error('❌ Error adding addon:', error);
    res.status(500).json({ message: 'Failed to add Stremio addon', error: error.message });
  }
});

// Remove external addon
router.delete('/addons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const removed = addonService.removeExternalAddon(id);
    
    if (removed) {
      res.status(200).json({ message: 'Addon removed successfully' });
    } else {
      res.status(404).json({ message: 'Addon not found' });
    }
  } catch (error) {
    console.error('❌ Error removing addon:', error);
    res.status(500).json({ message: 'Failed to remove Stremio addon', error: error.message });
  }
});

// Enable/disable external addon
router.patch('/addons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ message: 'Enabled status is required' });
    }
    
    const updated = addonService.setExternalAddonStatus(id, enabled);
    
    if (updated) {
      res.status(200).json({
        message: `Addon ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } else {
      res.status(404).json({ message: 'Addon not found' });
    }
  } catch (error) {
    console.error('❌ Error updating addon status:', error);
    res.status(500).json({ message: 'Failed to update Stremio addon status', error: error.message });
  }
});

// Clear cache
router.post('/cache/clear', (req, res) => {
  try {
    addonService.clearCache();
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    res.status(500).json({ message: 'Failed to clear cache', error: error.message });
  }
});

module.exports = router;