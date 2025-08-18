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
let userAddons = [
    {
        id: 'cinemeta',
        name: 'Cinemeta',
        url: 'https://v3-cinemeta.strem.io',
        description: 'Basic metadata for movies and series',
        resources: ['catalog', 'meta'],
        types: ['movie', 'series'],
        enabled: true
    },
    {
        id: 'crmb-addon',
        name: 'CRMB Addon',
        url: `${process.env.BASE_URL || 'http://localhost:3001'}/api/stremio`,
        description: 'Content discovery and streaming addon for CRMB',
        resources: ['stream'],
        types: ['movie', 'series'],
        enabled: true
    }
];

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

// Addon catalog endpoints - these are the missing endpoints causing 404 errors
router.get('/addon/:addonId/catalog/:type/:catalogId', async (req, res) => {
    try {
        const { addonId, type, catalogId } = req.params;
        const { skip = 0, limit = 20, genre, search, sort } = req.query;
        
        console.log(`Catalog request for addon: ${addonId}, type: ${type}, catalog: ${catalogId}`);
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        // For now, return a mock catalog response
        // In a real implementation, this would fetch from the actual addon
        const mockCatalog = {
            metas: [
                {
                    id: 'tt0111161',
                    type: 'movie',
                    name: 'The Shawshank Redemption',
                    poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
                    year: '1994',
                    imdbRating: '9.3',
                    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.'
                },
                {
                    id: 'tt0068646',
                    type: 'movie',
                    name: 'The Godfather',
                    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                    year: '1972',
                    imdbRating: '9.2',
                    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.'
                },
                {
                    id: 'tt0071562',
                    type: 'movie',
                    name: 'The Godfather: Part II',
                    poster: 'https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
                    year: '1974',
                    imdbRating: '9.0',
                    description: 'The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.'
                },
                {
                    id: 'tt0468569',
                    type: 'movie',
                    name: 'The Dark Knight',
                    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
                    year: '2008',
                    imdbRating: '9.0',
                    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
                },
                {
                    id: 'tt0050083',
                    type: 'movie',
                    name: '12 Angry Men',
                    poster: 'https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg',
                    year: '1957',
                    imdbRating: '9.0',
                    description: 'A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.'
                },
                {
                    id: 'tt0108052',
                    type: 'movie',
                    name: 'Schindler\'s List',
                    poster: 'https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
                    year: '1993',
                    imdbRating: '8.9',
                    description: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.'
                }
            ]
        };
        
        // Apply pagination
        const startIndex = parseInt(skip);
        const endIndex = startIndex + parseInt(limit);
        const paginatedMetas = mockCatalog.metas.slice(startIndex, endIndex);
        
        res.json({ metas: paginatedMetas });
    } catch (error) {
        console.error('Error handling catalog request:', error);
        res.status(500).json({ error: 'Failed to fetch catalog' });
    }
});

// Alternative catalog endpoint format (ad_catalog)
router.get('/ad_catalog/:type/:catalogId', async (req, res) => {
    try {
        const { type, catalogId } = req.params;
        const { skip = 0, limit = 20 } = req.query;
        
        console.log(`Ad catalog request for type: ${type}, catalog: ${catalogId}`);
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        // Redirect to the standard catalog endpoint
        return res.redirect(`/api/stremio/addon/cinemeta/catalog/${type}/${catalogId}?skip=${skip}&limit=${limit}`);
    } catch (error) {
        console.error('Error handling ad catalog request:', error);
        res.status(500).json({ error: 'Failed to fetch ad catalog' });
    }
});

// Addon manifest endpoint
router.get('/addon/:addonId/manifest', async (req, res) => {
    try {
        const { addonId } = req.params;
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        // Return a basic manifest for the requested addon
        const addonManifest = {
            id: `org.stremio.${addonId}`,
            version: '1.0.0',
            name: addonId.charAt(0).toUpperCase() + addonId.slice(1),
            description: `${addonId} addon for CRMB`,
            resources: ['catalog', 'meta', 'stream'],
            types: ['movie', 'series'],
            catalogs: [
                {
                    type: 'movie',
                    id: 'top',
                    name: 'Top Movies'
                },
                {
                    type: 'series',
                    id: 'top',
                    name: 'Top Series'
                }
            ]
        };
        
        res.json(addonManifest);
    } catch (error) {
        console.error('Error handling manifest request:', error);
        res.status(500).json({ error: 'Failed to fetch manifest' });
    }
});

// Meta endpoint for getting detailed metadata
router.get('/addon/:addonId/meta/:type/:id', async (req, res) => {
    try {
        const { addonId, type, id } = req.params;
        
        console.log(`Meta request for addon: ${addonId}, type: ${type}, id: ${id}`);
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        
        // Return mock metadata
        const mockMeta = {
            meta: {
                id: id,
                type: type,
                name: 'Sample Content',
                poster: 'https://via.placeholder.com/300x450',
                year: '2024',
                imdbRating: '8.0',
                description: 'Sample content description',
                genres: ['Action', 'Drama'],
                cast: ['Actor 1', 'Actor 2'],
                director: ['Director 1']
            }
        };
        
        res.json(mockMeta);
    } catch (error) {
        console.error('Error handling meta request:', error);
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

// Root endpoint
router.get('/', (req, res) => {
    res.redirect(`${req.baseUrl}/manifest.json`);
});

module.exports = router;