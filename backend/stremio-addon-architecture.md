# Stremio Addon Integration Architecture

This document outlines the proposed architecture for integrating Stremio addons into the CRMB backend using the `stremio-addon-client` library.

## 1. Analysis of Existing Code

The current implementation uses the `stremio-addon-sdk` to create a custom Stremio addon within the CRMB backend. This approach has several limitations:

- **Limited Functionality:** The `stremio-addon-sdk` is designed for creating addons, not for consuming them. This makes it difficult to fetch data from multiple addons and aggregate the results.
- **Duplicate Results:** The current implementation fetches data from each addon individually, which can lead to duplicate results if multiple addons provide the same content.
- **Maintenance Overhead:** The custom addon requires ongoing maintenance to ensure compatibility with the Stremio ecosystem.
- **Home Screen and Search Issues:** The current implementation is not properly loading metadata from addons for the home screen and search functionality.

### Current Implementation Overview

The current implementation consists of:

1. **`backend/routes/stremio.js`**: Defines the API routes for Stremio integration and serves the addon interface.
2. **`backend/addon.js`**: Implements the Stremio addon using the `stremio-addon-sdk` library.
3. **`backend/lib/metadata.js`**: Provides metadata for movies and series from TMDB.

## 2. Proposed Architecture

The new architecture will use the `stremio-addon-client` library to fetch data from Stremio addons. This library is designed for consuming addons and provides a simple and efficient way to interact with the Stremio ecosystem.

### Key Components

The new architecture will consist of the following components:

- **Addon Service:** A new service that encapsulates the logic for interacting with the `stremio-addon-client` library. This service will be responsible for:
  - Managing addon connections
  - Fetching data from addons
  - Aggregating results and removing duplicates
  - Caching results for improved performance
  - Handling errors and retries

- **Stremio Controller:** A new controller that handles the business logic for Stremio-related operations. This controller will:
  - Process incoming requests
  - Call the appropriate methods on the addon service
  - Format responses for the frontend

- **Stremio Routes:** The existing Stremio routes will be updated to use the new controller. This will ensure that the frontend can continue to interact with the backend in the same way.

- **Configuration:** The addon configuration will be moved to a separate configuration file to make it easier to manage.

### Addon Service Implementation

The addon service will be implemented as a class with the following methods:

```javascript
class AddonService {
  constructor(config) {
    this.config = config;
    this.addonClient = null;
    this.addons = new Map();
    this.cache = new Map();
    this.initialize();
  }

  async initialize() {
    // Initialize the addon client
    this.addonClient = new AddonClient();
    
    // Load configured addons
    for (const addon of this.config.addons) {
      await this.loadAddon(addon.url);
    }
  }

  async loadAddon(url) {
    try {
      const addon = await this.addonClient.loadAddon(url);
      this.addons.set(addon.manifest.id, addon);
      return addon;
    } catch (error) {
      console.error(`Failed to load addon from ${url}:`, error);
      return null;
    }
  }

  async getCatalog(type, id, options = {}) {
    const results = [];
    const seenItems = new Set();
    
    for (const addon of this.addons.values()) {
      if (this.supportsResource(addon, 'catalog', type)) {
        try {
          const catalog = await addon.getCatalog(type, id, options);
          
          // Filter out duplicates
          for (const item of catalog.metas || []) {
            if (!seenItems.has(item.id)) {
              seenItems.add(item.id);
              results.push(item);
            }
          }
        } catch (error) {
          console.error(`Failed to get catalog from ${addon.manifest.id}:`, error);
        }
      }
    }
    
    return { metas: results };
  }

  async search(type, query) {
    // Similar to getCatalog but with search parameters
    // ...
  }

  async getMeta(type, id) {
    // Get metadata for a specific item
    // ...
  }

  async getStreams(type, id) {
    // Get streams for a specific item
    // ...
  }

  supportsResource(addon, resource, type) {
    return addon.manifest.resources && 
           addon.manifest.resources.includes(resource) && 
           addon.manifest.types && 
           addon.manifest.types.includes(type);
  }
}
```

## 3. Data Flow

The data flow for fetching catalog and search results from the addons will be as follows:

1. **Request Initiation**: The frontend sends a request to the backend to fetch catalog or search results.
   ```
   GET /api/stremio/catalog/{type}/{id}?skip=0&limit=100
   ```

2. **Route Handling**: The backend routes the request to the appropriate controller method.
   ```javascript
   router.get('/catalog/:type/:id', stremioController.getCatalog);
   ```

3. **Controller Processing**: The controller extracts parameters and calls the addon service.
   ```javascript
   const { type, id } = req.params;
   const { skip, limit, genre, search } = req.query;
   const options = { skip, limit, genre, search };
   const result = await addonService.getCatalog(type, id, options);
   ```

4. **Addon Service**: The addon service fetches data from multiple addons using the `stremio-addon-client` library.
   - For each configured addon:
     - Check if the addon supports the requested resource and type
     - Fetch data from the addon
     - Add unique results to the collection

5. **Deduplication**: The addon service removes duplicate results based on item IDs.

6. **Response**: The controller formats the response and sends it back to the frontend.
   ```javascript
   res.json(result);
   ```

### Sequence Diagram

```
Frontend                Backend                 AddonService           Stremio Addons
   |                       |                         |                      |
   | Request Catalog       |                         |                      |
   |---------------------->|                         |                      |
   |                       | Call AddonService       |                      |
   |                       |------------------------>|                      |
   |                       |                         | Load Addon 1         |
   |                       |                         |--------------------->|
   |                       |                         | Response             |
   |                       |                         |<---------------------|
   |                       |                         | Load Addon 2         |
   |                       |                         |--------------------->|
   |                       |                         | Response             |
   |                       |                         |<---------------------|
   |                       |                         | Deduplicate Results  |
   |                       |                         |------------------    |
   |                       |                         |                 |    |
   |                       |                         |<-----------------    |
   |                       | Return Results          |                      |
   |                       |<------------------------|                      |
   | Response with Results |                         |                      |
   |<----------------------|                         |                      |
   |                       |                         |                      |
```

## 4. File Structure

The new file structure for the backend will be as follows:

```
backend/
├── config/
│   └── addons.js         # Configuration for Stremio addons
├── controllers/
│   └── stremio.js        # Controller for Stremio routes
├── lib/
│   └── metadata.js       # Metadata provider (existing)
├── routes/
│   ├── index.js          # Main router
│   └── stremio.js        # Stremio routes
├── services/
│   └── addon.js          # Addon service using stremio-addon-client
└── server.js             # Main server file
```

### Key Files

#### `config/addons.js`

```javascript
module.exports = {
  addons: [
    {
      id: 'cinemeta',
      name: 'Cinemeta',
      url: 'https://v3-cinemeta.strem.io',
      description: 'Basic metadata for movies and series',
      resources: ['catalog', 'meta'],
      types: ['movie', 'series'],
      enabled: true
    },
    // Additional addons...
  ]
};
```

#### `services/addon.js`

This file will implement the AddonService class described above.

#### `controllers/stremio.js`

```javascript
const AddonService = require('../services/addon');
const addonConfig = require('../config/addons');

const addonService = new AddonService(addonConfig);

exports.getAddons = async (req, res) => {
  try {
    const addons = Array.from(addonService.addons.values()).map(addon => ({
      id: addon.manifest.id,
      name: addon.manifest.name,
      url: addon.transportUrl,
      description: addon.manifest.description,
      resources: addon.manifest.resources,
      types: addon.manifest.types,
      enabled: true
    }));
    
    res.status(200).json({ addons });
  } catch (error) {
    console.error('Error fetching addons:', error);
    res.status(500).json({ message: 'Failed to fetch Stremio add-ons' });
  }
};

exports.getCatalog = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { skip, limit, genre, search } = req.query;
    const options = { skip, limit, genre, search };
    
    const result = await addonService.getCatalog(type, id, options);
    res.json(result);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ message: 'Failed to fetch catalog', error: error.message });
  }
};

// Additional controller methods...
```

#### `routes/stremio.js`

```javascript
const express = require('express');
const router = express.Router();
const stremioController = require('../controllers/stremio');

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

module.exports = router;
```

## 5. Benefits of the New Architecture

The new architecture offers several benefits over the current implementation:

1. **Improved Performance**: By using the `stremio-addon-client` library, we can more efficiently fetch data from Stremio addons.

2. **Reduced Duplication**: The new architecture includes deduplication logic to prevent duplicate results.

3. **Better Error Handling**: The addon service includes robust error handling to prevent failures when addons are unavailable.

4. **Simplified Maintenance**: By separating the addon service from the routes and controllers, we make the code easier to maintain and test.

5. **Enhanced Flexibility**: The new architecture makes it easier to add, remove, or update addons without changing the core logic.

6. **Improved Caching**: The addon service can implement caching to improve performance and reduce load on the Stremio addons.

## 6. Implementation Plan

1. Install the `stremio-addon-client` library:
   ```
   npm install stremio-addon-client --save
   ```

2. Create the new file structure and implement the addon service.

3. Update the Stremio routes to use the new controller.

4. Test the new implementation with various addons and content types.

5. Update the frontend to work with the new backend implementation if necessary.

## 7. Conclusion

The proposed architecture addresses the current issues with the Stremio addon integration by using the `stremio-addon-client` library to fetch data from Stremio addons. This approach will improve performance, reduce duplication, and make the code easier to maintain.