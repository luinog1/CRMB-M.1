# Stremio Addon Integration Refactoring Plan

## 1. Introduction

This document outlines the plan for refactoring the existing Stremio addon integration to align with the official Stremio addon SDK and best practices. The current implementation uses the `stremio-addon-client` library to consume addons, but we will refactor it to use the official Stremio addon SDK to create and serve our own addon.

## 2. Current Architecture

The current implementation has the following components:

- **Manifest Route (`routes/manifest.js`)**: Serves a static manifest.json file.
- **Addon Service (`services/addon.js`)**: Uses the `stremio-addon-client` library to fetch data from Stremio addons.
- **Addon Instance (`services/addonInstance.js`)**: Contains complex initialization logic that creates a mock service first and then replaces it with the real service asynchronously.
- **Controller (`controllers/stremio.js`)**: Handles requests and calls the addon service.
- **Routes (`routes/stremio.js`)**: Defines routes for catalog, meta, streams, and search.
- **Server (`server.js`)**: Mounts the routes.

### Current Issues:

1. The implementation is using `stremio-addon-client` which is designed for consuming addons, not for creating them.
2. The initialization logic in `addonInstance.js` is complex and uses a mock service.
3. The controller has hardcoded mock data for some endpoints.
4. The routes don't follow the Stremio addon SDK structure.

## 3. New Architecture

The new architecture will use the official Stremio addon SDK to create and serve our own addon. It will have the following components:

- **Manifest (`manifest.js`)**: A module that exports the manifest object describing the addon's capabilities.
- **Addon Service (`services/addon.js`)**: A lightweight service that fetches data from configured addons.
- **Routes (`routes/addonRoutes.js`)**: Routes that follow the Stremio addon SDK structure.
- **Controller (`controllers/stremio.js`)**: A simple controller that calls the addon service and returns data in the correct format.
- **Server (`server.js`)**: Mounts the new routes.

## 4. Component Refactoring

### 4.1 Manifest

#### Current Implementation:
```javascript
// routes/manifest.js
router.get('/manifest.json', (req, res) => {
  const manifest = {
    id: 'crmb.addon',
    name: 'CRMB Addon',
    version: '1.0.0',
    description: 'Content discovery and streaming addon for CRMB',
    logo: 'https://i.imgur.com/LuQc9tJ.png',
    background: 'https://i.imgur.com/LuQc9tJ.png',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie', 'series'],
    catalogs: [
      {
        type: 'movie',
        id: 'top',
        name: 'Top Movies',
        extra: [
          { name: 'skip' },
          { name: 'genre' }
        ]
      },
      {
        type: 'series',
        id: 'top',
        name: 'Top Series',
        extra: [
          { name: 'skip' },
          { name: 'genre' }
        ]
      }
    ],
    idPrefixes: ['tt'],
    behaviorHints: {
      configurable: true,
      configurationRequired: false
    }
  };
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.json(manifest);
});
```

#### New Implementation:
```javascript
// manifest.js
module.exports = {
  id: 'crmb.addon',
  name: 'CRMB Addon',
  version: '1.0.0',
  description: 'Content discovery and streaming addon for CRMB',
  logo: 'https://i.imgur.com/LuQc9tJ.png',
  background: 'https://i.imgur.com/LuQc9tJ.png',
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'series'],
  catalogs: [
    {
      type: 'movie',
      id: 'top',
      name: 'Top Movies',
      extra: [
        { name: 'skip' },
        { name: 'genre' }
      ]
    },
    {
      type: 'series',
      id: 'top',
      name: 'Top Series',
      extra: [
        { name: 'skip' },
        { name: 'genre' }
      ]
    }
  ],
  idPrefixes: ['tt'],
  behaviorHints: {
    configurable: true,
    configurationRequired: false
  }
};
```

### 4.2 Addon Service

#### Current Implementation:
The current implementation uses the `stremio-addon-client` library to fetch data from Stremio addons. It has methods for fetching catalogs, metadata, and streams.

#### New Implementation:
```javascript
// services/addon.js
const { addonBuilder } = require('stremio-addon-sdk');
const manifest = require('../manifest');

class AddonService {
  constructor(config) {
    this.config = config;
    this.builder = new addonBuilder(manifest);
    this.initialize();
  }

  initialize() {
    // Define catalog handler
    this.builder.defineCatalogHandler(this.getCatalog.bind(this));
    
    // Define meta handler
    this.builder.defineMetaHandler(this.getMeta.bind(this));
    
    // Define stream handler
    this.builder.defineStreamHandler(this.getStreams.bind(this));
    
    // Get the addon instance
    this.addon = this.builder.getInterface();
  }

  async getCatalog(args) {
    const { type, id, extra } = args;
    
    // Implement catalog fetching logic
    // This will replace the current implementation that uses stremio-addon-client
    
    return { metas: [] }; // Return empty array for now
  }

  async getMeta(args) {
    const { type, id } = args;
    
    // Implement metadata fetching logic
    
    return { meta: null }; // Return null for now
  }

  async getStreams(args) {
    const { type, id } = args;
    
    // Implement streams fetching logic
    
    return { streams: [] }; // Return empty array for now
  }

  getAddon() {
    return this.addon;
  }
}

module.exports = AddonService;
```

### 4.3 Routes

#### Current Implementation:
```javascript
// routes/stremio.js
const express = require('express');
const router = express.Router();
const stremioController = require('../controllers/stremio');

// Test endpoint
router.get('/test', stremioController.test);

// Get addons list
router.get('/addons', stremioController.getAddons);

// Get catalog
router.get('/catalog/:type/:id', stremioController.getCatalog);

// Get metadata
router.get('/meta/:type/:id', stremioController.getMeta);

// Get streams
router.get('/streams/:type/:id', stremioController.getStreams);

// Search
router.get('/search/:type', stremioController.search);

// Clear cache
router.post('/cache/clear', stremioController.clearCache);

// Install addon
router.post('/install-addon', stremioController.installAddon);

module.exports = router;
```

#### New Implementation:
```javascript
// routes/addonRoutes.js
const express = require('express');
const router = express.Router();
const AddonService = require('../services/addon');
const addonConfig = require('../config/addons');

// Create addon service
const addonService = new AddonService(addonConfig);
const addon = addonService.getAddon();

// Serve the manifest
router.get('/manifest.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.send(addon.manifest);
});

// Serve catalog
router.get('/catalog/:type/:id.json', (req, res) => {
  addon.catalog(req.params, req.query)
    .then(result => res.send(result))
    .catch(err => {
      console.error('Error serving catalog:', err);
      res.status(500).send({ error: 'Internal server error' });
    });
});

// Serve metadata
router.get('/meta/:type/:id.json', (req, res) => {
  addon.meta(req.params, req.query)
    .then(result => res.send(result))
    .catch(err => {
      console.error('Error serving metadata:', err);
      res.status(500).send({ error: 'Internal server error' });
    });
});

// Serve streams
router.get('/stream/:type/:id.json', (req, res) => {
  addon.stream(req.params, req.query)
    .then(result => res.send(result))
    .catch(err => {
      console.error('Error serving streams:', err);
      res.status(500).send({ error: 'Internal server error' });
    });
});

module.exports = router;
```

### 4.4 Controller

The controller will be simplified since most of the logic will be handled by the addon service. We'll keep a minimal controller for any additional functionality we might need.

```javascript
// controllers/stremio.js
const AddonService = require('../services/addon');
const addonConfig = require('../config/addons');

// Create addon service
const addonService = new AddonService(addonConfig);

// Get addons list
exports.getAddons = async (req, res) => {
  try {
    // This will return a list of configured addons
    const addons = addonConfig.addons.map(addon => ({
      id: addon.id,
      name: addon.name,
      url: addon.url,
      description: addon.description,
      resources: addon.resources,
      types: addon.types,
      enabled: addon.enabled
    }));
    
    res.status(200).json({ addons });
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ message: 'Failed to fetch Stremio add-ons', error: error.message });
  }
};

// Other controller methods as needed
```

### 4.5 Server

#### Current Implementation:
```javascript
// server.js
// API Routes
// app.use('/api', apiRoutes);

// Manifest Routes - for Stremio addon discovery
// app.use('/', manifestRoutes);
```

#### New Implementation:
```javascript
// server.js
const addonRoutes = require('./routes/addonRoutes');

// Mount addon routes
app.use('/', addonRoutes);

// API Routes
app.use('/api', apiRoutes);
```

## 5. Implementation Steps

1. **Install the Stremio Addon SDK**:
   ```
   npm install stremio-addon-sdk --save
   ```

2. **Create the Manifest File**:
   - Create a new file `manifest.js` in the root directory.
   - Define the manifest object as shown above.

3. **Refactor the Addon Service**:
   - Update `services/addon.js` to use the Stremio addon SDK.
   - Implement the catalog, meta, and stream handlers.

4. **Create the Addon Routes**:
   - Create a new file `routes/addonRoutes.js`.
   - Implement the routes as shown above.

5. **Update the Controller**:
   - Simplify the controller to use the new addon service.

6. **Update the Server**:
   - Mount the new addon routes.

7. **Test the Implementation**:
   - Test the manifest endpoint.
   - Test the catalog endpoint.
   - Test the meta endpoint.
   - Test the stream endpoint.

## 6. Migration Strategy

1. **Parallel Implementation**:
   - Keep the current implementation working while developing the new one.
   - This allows for easy rollback if issues arise.

2. **Incremental Testing**:
   - Test each component individually before integrating.
   - Start with the manifest, then catalog, meta, and finally streams.

3. **Feature Parity**:
   - Ensure the new implementation provides all the features of the current one.
   - This includes support for all content types and resources.

4. **Deployment**:
   - Deploy the new implementation to a staging environment first.
   - Test thoroughly before deploying to production.

5. **Monitoring**:
   - Monitor the new implementation for any issues.
   - Be prepared to roll back if necessary.

## 7. Conclusion

This refactoring plan outlines the steps to migrate from the current implementation using `stremio-addon-client` to a new implementation using the official Stremio addon SDK. By following this plan, we will create a more maintainable and standards-compliant Stremio addon integration.