const express = require('express');
const router = express.Router();
const addonClient = require('../services/addonClient');

// GET /api/addons - Get all loaded addons
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Getting all addons...');
    const addons = addonClient.getAddons();
    console.log(`📋 Found ${addons.length} addons`);

    res.json({
      success: true,
      addons: addons,
      metadata: {
        count: addons.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error getting addons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /api/addons/available - Get available addons from config
router.get('/available', async (req, res) => {
  try {
    console.log('🔍 Getting available addons...');
    const availableAddons = addonClient.getAvailableAddons();
    console.log(`📋 Found ${availableAddons.length} available addons`);

    res.json({
      success: true,
      addons: availableAddons,
      metadata: {
        count: availableAddons.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error getting available addons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /api/addons/health - Get addon health status
router.get('/health', async (req, res) => {
  try {
    console.log('🔍 Getting addon health status...');
    const healthStatus = addonClient.getAddonHealthStatus();

    res.json({
      success: true,
      health: healthStatus,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error getting addon health:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /api/addons - Add a new addon
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Addon URL is required',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log(`🔍 Adding addon from URL: ${url}`);
    const newAddon = await addonClient.addAddon(url);

    if (newAddon) {
      console.log('✅ Addon added successfully');
      res.json({
        success: true,
        addon: newAddon,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('❌ Failed to add addon');
      res.status(400).json({
        success: false,
        error: 'Failed to add addon',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('❌ Error adding addon:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

// PUT /api/addons/:id/status - Enable/disable an addon
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Enabled status must be a boolean',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log(`🔄 Setting addon ${id} status to ${enabled}`);
    const success = addonClient.setAddonStatus(id, enabled);

    if (success) {
      console.log('✅ Addon status updated successfully');
      res.json({
        success: true,
        id,
        enabled,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('❌ Failed to update addon status');
      res.status(404).json({
        success: false,
        error: 'Addon not found',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('❌ Error updating addon status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

// DELETE /api/addons/:id - Remove an addon
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Removing addon: ${id}`);
    const success = addonClient.removeAddon(id);

    if (success) {
      console.log('✅ Addon removed successfully');
      res.json({
        success: true,
        id,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('❌ Failed to remove addon');
      res.status(404).json({
        success: false,
        error: 'Addon not found',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('❌ Error removing addon:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;