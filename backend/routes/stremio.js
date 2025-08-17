const express = require('express');
const router = express.Router();
const { addonBuilder } = require('stremio-addon-sdk');

console.log('Stremio routes module loaded');

// Define the addon manifest
const manifest = {
    id: 'org.stremio.crmb',
    version: '1.0.0',
    name: 'CRMB Addon',
    description: 'Content discovery and streaming addon for CRMB',
    resources: ['stream'],
    types: ['movie', 'series'],
    catalogs: [],
    background: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/background.jpg',
    logo: 'https://raw.githubusercontent.com/Stremio/stremio-art/main/stremio-logo.svg',
    behaviorHints: {
        adult: false,
        p2p: false
    }
};

// Create a new addon builder with the manifest
const builder = new addonBuilder(manifest);

// Define the stream handler
builder.defineStreamHandler(async ({ type, id }) => {
    console.log(`Stream request for ${type}/${id}`);
    
    try {
        const streams = [];
        
        if (type === 'movie' && id.startsWith('tt')) {
            streams.push({
                name: 'CRMB Stream',
                title: 'CRMB Stream',
                url: `https://example.com/stream/${id}`,
            });
        }
        
        if (type === 'series' && id.includes(':')) {
            const [imdbId, season, episode] = id.split(':');
            streams.push({
                name: `CRMB Stream S${season}E${episode}`,
                title: `CRMB Stream S${season}E${episode}`,
                url: `https://example.com/stream/${imdbId}/${season}/${episode}`,
            });
        }
        
        return { streams };
    } catch (error) {
        console.error('Error in stream handler:', error);
        return { streams: [] };
    }
});

// Build the addon interface
let addonInterface;

// Initialize the addon immediately
(async function initAddon() {
    try {
        addonInterface = await builder.getInterface();
        console.log('Stremio addon initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Stremio addon:', error);
    }
})();

// Store installed addons (for backward compatibility)
let userAddons = [];

// Test endpoint to verify routing
router.get('/test', (req, res) => {
    console.log('Test endpoint hit!');
    console.log('Original URL:', req.originalUrl);
    console.log('Base URL:', req.baseUrl);
    console.log('Path:', req.path);
    
    res.status(200).json({
        message: 'Stremio router is working!',
        path: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        params: req.params
    });
});

// Custom API endpoints
router.get('/status', (req, res) => {
    res.status(200).json({
        initialized: !!addonInterface,
        manifest: addonInterface ? addonInterface.manifest : null
    });
});

router.post('/install-addon', async (req, res) => {
    const { addonUrl } = req.body;
    
    if (!addonUrl) {
        return res.status(400).json({ message: 'Add-on URL is required' });
    }
    
    try {
        // Get the base URL for our addon
        const protocol = req.protocol;
        const host = req.get('host');
        const ownAddonUrl = `${protocol}://${host}/api/stremio`;
        
        const existingAddon = userAddons.find(addon => addon.url === ownAddonUrl);
        if (!existingAddon) {
            userAddons.push({
                id: manifest.id,
                name: manifest.name,
                url: ownAddonUrl,
                description: manifest.description,
                resources: manifest.resources,
                types: manifest.types,
                enabled: true
            });
        }
        
        res.status(200).json({
            message: 'Add-on installed successfully',
            addon: {
                id: manifest.id,
                name: manifest.name,
                url: ownAddonUrl,
                description: manifest.description
            }
        });
    } catch (error) {
        console.error('Stremio add-on installation error:', error);
        res.status(500).json({ message: 'Failed to install add-on' });
    }
});

router.get('/addons', async (req, res) => {
    try {
        res.status(200).json({
            addons: userAddons
        });
    } catch (error) {
        console.error('Stremio add-ons error:', error);
        res.status(500).json({ message: 'Failed to fetch Stremio add-ons' });
    }
});

// Serve the manifest.json
router.get('/manifest.json', (req, res) => {
    if (addonInterface) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.send(manifest);
    } else {
        res.status(503).json({ error: 'Addon not initialized' });
    }
});

// Serve stream requests
router.get('/stream/:type/:id.json', async (req, res) => {
    try {
        const { type, id } = req.params;
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        // Create a simple stream response based on the type and id
        const streams = [];
        
        if (type === 'movie' && id.startsWith('tt')) {
            streams.push({
                name: 'CRMB Stream',
                title: 'CRMB Stream',
                url: `https://example.com/stream/${id}`,
            });
        }
        
        if (type === 'series' && id.includes(':')) {
            const [imdbId, season, episode] = id.split(':');
            streams.push({
                name: `CRMB Stream S${season}E${episode}`,
                title: `CRMB Stream S${season}E${episode}`,
                url: `https://example.com/stream/${imdbId}/${season}/${episode}`,
            });
        }
        
        console.log(`Stream request for ${type}/${id} - returning ${streams.length} streams`);
        res.send({ streams });
    } catch (error) {
        console.error('Error handling stream request:', error);
        res.status(500).json({ error: 'Failed to process stream request' });
    }
});

// Root endpoint
router.get('/', (req, res) => {
    res.redirect(`${req.baseUrl}/manifest.json`);
});

module.exports = router;