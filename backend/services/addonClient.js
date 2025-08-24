/**
 * Stremio Addon Client Service
 * This service uses the stremio-addon-client library to fetch data from external Stremio addons.
 */

const stremioAddonClient = require('stremio-addon-client');
const axios = require('axios');
const addonsConfig = require('../config/addons');

class StremioAddonClient {
  constructor() {
    this.client = stremioAddonClient;
    this.addons = new Map();
    this.cache = new Map();
    this.cacheExpiration = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Initialize the addon client by loading all configured addons
    */
   async initialize() {
     console.log('🔄 Initializing StremioAddonClient...');
     const enabledAddons = addonsConfig.addons.filter(addon => addon.enabled);
     console.log('Addons to load:', enabledAddons.map(a => `${a.name} (${a.url})`));

     try {
       // Load all enabled addons from config
       const loadPromises = enabledAddons.map(addon => this.loadAddon(addon.url));

       const results = await Promise.allSettled(loadPromises);

       // Analyze results
       const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
       const failed = results.filter(result => result.status === 'rejected' || !result.value).length;

       console.log(`✅ Addon initialization complete: ${successful} successful, ${failed} failed`);

       if (successful === 0) {
         console.error('❌ No addons could be loaded! The application may not function properly.');
         return false;
       }

       if (failed > 0) {
         console.warn(`⚠️  ${failed} addons failed to load, but ${successful} are working`);
       }

       return true;
     } catch (error) {
       console.error('❌ Error initializing StremioAddonClient:', error);
       return false;
     }
   }

  /**
   * Load an addon from a URL
   * @param {string} url - The URL of the addon manifest
   * @returns {Promise<object|null>} - The loaded addon or null if failed
   */
  async loadAddon(url) {
    try {
      console.log(`🔍 Loading addon from ${url}...`);
      const result = await this.client.detectFromURL(url);
      
      if (result && result.addon && result.addon.manifest && result.addon.manifest.id) {
        // Store the addon instance with its client
        this.addons.set(result.addon.manifest.id, {
          manifest: result.addon.manifest,
          client: result.addon
        });
        console.log(`✅ Loaded addon: ${result.addon.manifest.name} (${result.addon.manifest.id})`);
        return result.addon;
      } else {
        console.error(`❌ Invalid addon from ${url}: missing manifest or ID`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Failed to load addon from ${url}:`, error);
      return null;
    }
  }

  /**
   * Get a list of all loaded addons
   * @returns {Array} - Array of addon manifests
   */
  getAddons() {
    return Array.from(this.addons.values()).map(item => item.manifest);
  }

  /**
   * Get a list of all available addons from the configuration
   * @returns {Array} - Array of all available addon configurations
   */
  getAvailableAddons() {
    return addonsConfig.addons;
  }

  /**
   * Get health status of all addons
   * @returns {Object} - Health status report
   */
  getAddonHealthStatus() {
    const enabledAddons = addonsConfig.addons.filter(addon => addon.enabled);
    const loadedAddons = Array.from(this.addons.values());
    const loadedAddonIds = Array.from(this.addons.keys());

    const status = {
      total: enabledAddons.length,
      loaded: loadedAddons.length,
      failed: enabledAddons.length - loadedAddons.length,
      catalogSupport: loadedAddons.filter(item => {
        return item.manifest.resources.some(resource =>
          typeof resource === 'string' ? resource === 'catalog' : resource.name === 'catalog'
        );
      }).length,
      streamSupport: loadedAddons.filter(item => {
        return item.manifest.resources.some(resource =>
          typeof resource === 'string' ? resource === 'stream' : resource.name === 'stream'
        );
      }).length,
      metaSupport: loadedAddons.filter(item => {
        return item.manifest.resources.some(resource =>
          typeof resource === 'string' ? resource === 'meta' : resource.name === 'meta'
        );
      }).length,
      details: enabledAddons.map(addon => {
        // Find the loaded addon by matching URLs since IDs might differ
        const loadedAddon = loadedAddons.find(item => {
          // Match by URL since that's consistent between config and loaded addon
          return item.manifest.url === addon.url;
        });

        return {
          id: addon.id,
          name: addon.name,
          loaded: !!loadedAddon,
          resources: addon.resources
        };
      })
    };

    return status;
  }

  /**
   * Add a new addon by URL
   * @param {string} url - The URL of the addon manifest
   * @returns {Promise<object|null>} - The added addon or null if failed
   */
  async addAddon(url) {
    const addon = await this.loadAddon(url);
    if (addon) {
      // Check if this addon is already in the config
      const existingAddon = addonsConfig.addons.find(a => a.id === addon.manifest.id);
      
      if (!existingAddon) {
        // Add to config for persistence
        addonsConfig.addons.push({
          id: addon.manifest.id,
          name: addon.manifest.name,
          url: url,
          description: addon.manifest.description || '',
          resources: addon.manifest.resources || [],
          types: addon.manifest.types || [],
          enabled: true
        });
      }
      
      return addon.manifest;
    }
    return null;
  }

  /**
   * Remove an addon by ID
   * @param {string} id - The ID of the addon to remove
   * @returns {boolean} - Whether the addon was removed
   */
  removeAddon(id) {
    const removed = this.addons.delete(id);
    
    // Also remove from cache
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${id}:`)) {
        this.cache.delete(key);
      }
    }
    
    // Update config
    const index = addonsConfig.addons.findIndex(addon => addon.id === id);
    if (index !== -1) {
      addonsConfig.addons.splice(index, 1);
    }
    
    return removed;
  }

  /**
   * Enable or disable an addon
   * @param {string} id - The ID of the addon
   * @param {boolean} enabled - Whether to enable or disable
   * @returns {boolean} - Success status
   */
  setAddonStatus(id, enabled) {
    const addonIndex = addonsConfig.addons.findIndex(addon => addon.id === id);
    
    if (addonIndex !== -1) {
      addonsConfig.addons[addonIndex].enabled = enabled;
      
      // If disabling, remove from loaded addons
      if (!enabled) {
        this.addons.delete(id);
      } else if (!this.addons.has(id)) {
        // If enabling and not loaded, try to load it
        this.loadAddon(addonsConfig.addons[addonIndex].url);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Get catalog from loaded addons
   * @param {object} args - The catalog request arguments
   * @returns {Promise<object>} - The catalog response
   */
  async getCatalog(args) {
    const { type, id, extra = {} } = args;
    console.log(`🔍 Getting catalog from external addons: type=${type}, id=${id}`, extra);
    
    const cacheKey = `catalog:${type}:${id}:${JSON.stringify(extra)}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`🔄 Returning cached catalog for ${cacheKey}`);
      return cachedResult;
    }
    
    // Find addons that support this catalog type
    const supportingAddons = Array.from(this.addons.values()).filter(item => {
      // Handle both string resources and object resources
      const hasCatalogResource = item.manifest.resources.some(resource =>
        typeof resource === 'string' ? resource === 'catalog' :
        resource.name === 'catalog'
      );
      return hasCatalogResource && item.manifest.types.includes(type);
    });
    
    console.log(`📊 Found ${supportingAddons.length} addons supporting catalog ${type}/${id}`);
    
    if (supportingAddons.length === 0) {
      return { metas: [] };
    }
    
    // Collect results from all supporting addons
    const results = await Promise.allSettled(
      supportingAddons.map(async (addon) => {
        try {
          // Use the addon client's get method with correct parameter format
          const response = await addon.client.get('catalog', type, id, extra);
          return response && response.metas ? response.metas : [];
        } catch (error) {
          console.error(`❌ Error getting catalog from ${addon.manifest.name}:`, error);
          return [];
        }
      })
    );
    
    // Combine results from all addons
    const allMetas = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    // Remove duplicates based on id
    const uniqueMetas = Array.from(
      new Map(allMetas.map(meta => [meta.id, meta])).values()
    );
    
    const response = { metas: uniqueMetas };
    
    // Cache the results
    this.setCache(cacheKey, response);
    
    console.log(`📊 Total items from external addons: ${uniqueMetas.length}`);
    return response;
  }

  /**
   * Get metadata from loaded addons
   * @param {object} args - The meta request arguments
   * @returns {Promise<object>} - The meta response
   */
  async getMeta(args) {
    const { type, id } = args;
    console.log(`🔍 Getting metadata from external addons: type=${type}, id=${id}`);
    
    const cacheKey = `meta:${type}:${id}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`🔄 Returning cached metadata for ${cacheKey}`);
      return cachedResult;
    }
    
    // Find addons that support this meta type
    const supportingAddons = Array.from(this.addons.values()).filter(item => {
      // Handle both string resources and object resources
      const hasMetaResource = item.manifest.resources.some(resource =>
        typeof resource === 'string' ? resource === 'meta' :
        resource.name === 'meta'
      );
      return hasMetaResource && item.manifest.types.includes(type);
    });
    
    console.log(`📊 Found ${supportingAddons.length} addons supporting meta ${type}/${id}`);
    
    if (supportingAddons.length === 0) {
      return { meta: null };
    }
    
    // Try to get metadata from each addon until we find one that works
    for (const addon of supportingAddons) {
      try {
        // Use the addon client's get method with correct parameter format
        const response = await addon.client.get('meta', type, id);
        if (response && response.meta) {
          // Cache the result
          this.setCache(cacheKey, response);
          return response;
        }
      } catch (error) {
        console.error(`❌ Error getting metadata from ${addon.manifest.name}:`, error);
      }
    }
    
    return { meta: null };
  }

  /**
   * Get streams from loaded addons
   * @param {object} args - The stream request arguments
   * @returns {Promise<object>} - The stream response
   */
  async getStreams(args) {
    const { type, id } = args;
    console.log(`🔍 Getting streams from external addons: type=${type}, id=${id}`);
    
    const cacheKey = `streams:${type}:${id}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`🔄 Returning cached streams for ${cacheKey}`);
      return cachedResult;
    }
    
    // Find addons that support streams for this type
    const supportingAddons = Array.from(this.addons.values()).filter(item => {
      // Handle both string resources and object resources
      const hasStreamResource = item.manifest.resources.some(resource =>
        typeof resource === 'string' ? resource === 'stream' :
        resource.name === 'stream'
      );
      return hasStreamResource && item.manifest.types.includes(type);
    });
    
    console.log(`📊 Found ${supportingAddons.length} addons supporting streams for ${type}/${id}`);
    
    if (supportingAddons.length === 0) {
      return { streams: [] };
    }
    
    // Collect results from all supporting addons
    const results = await Promise.allSettled(
      supportingAddons.map(async (addon) => {
        try {
          // Use the addon client's get method with correct parameter format
          const response = await addon.client.get('stream', type, id);
          return response && response.streams ? response.streams : [];
        } catch (error) {
          console.error(`❌ Error getting streams from ${addon.manifest.name}:`, error);
          return [];
        }
      })
    );
    
    // Combine results from all addons
    const allStreams = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    const response = { streams: allStreams };
    
    // Cache the results
    this.setCache(cacheKey, response);
    
    console.log(`📊 Total streams from external addons: ${allStreams.length}`);
    return response;
  }

  /**
   * Get subtitles from loaded addons
   * @param {object} args - The subtitles request arguments
   * @returns {Promise<object>} - The subtitles response
   */
  async getSubtitles(args) {
    const { type, id, extra = {} } = args;
    console.log(`🔍 Getting subtitles from external addons: type=${type}, id=${id}`, extra);
    
    const cacheKey = `subtitles:${type}:${id}:${JSON.stringify(extra)}`;
    
    // Check cache first
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`🔄 Returning cached subtitles for ${cacheKey}`);
      return cachedResult;
    }
    
    // Find addons that support subtitles for this type
    const supportingAddons = Array.from(this.addons.values()).filter(item => {
      // Handle both string resources and object resources
      const hasSubtitlesResource = item.manifest.resources.some(resource =>
        typeof resource === 'string' ? resource === 'subtitles' :
        resource.name === 'subtitles'
      );
      return hasSubtitlesResource && item.manifest.types.includes(type);
    });
    
    console.log(`📊 Found ${supportingAddons.length} addons supporting subtitles for ${type}/${id}`);
    
    if (supportingAddons.length === 0) {
      return { subtitles: [] };
    }
    
    // Collect results from all supporting addons
    const results = await Promise.allSettled(
      supportingAddons.map(async (addon) => {
        try {
          // Use the addon client's get method with correct parameter format
          const response = await addon.client.get('subtitles', type, id, extra);
          return response && response.subtitles ? response.subtitles : [];
        } catch (error) {
          console.error(`❌ Error getting subtitles from ${addon.manifest.name}:`, error);
          return [];
        }
      })
    );
    
    // Combine results from all addons
    const allSubtitles = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
    
    const response = { subtitles: allSubtitles };
    
    // Cache the results
    this.setCache(cacheKey, response);
    
    console.log(`📊 Total subtitles from external addons: ${allSubtitles.length}`);
    return response;
  }

 /**
  * Search across loaded addons
  * @param {object} args - The search request arguments
  * @returns {Promise<object>} - The search response
  */
 async search(args) {
   const { query } = args;
   console.log(`🔍 Searching across external addons: query=${query}`);
   
   // Find addons that support search
   const supportingAddons = Array.from(this.addons.values()).filter(item => {
     return item.manifest.resources.some(resource =>
       typeof resource === 'string' ? resource === 'catalog' :
       resource.name === 'catalog' && resource.types.includes('search')
     );
   });
   
   console.log(`📊 Found ${supportingAddons.length} addons supporting search`);
   
   if (supportingAddons.length === 0) {
     return { metas: [] };
   }
   
   // Collect results from all supporting addons
   const results = await Promise.allSettled(
     supportingAddons.map(async (addon) => {
       try {
         // Use the addon client's get method with search parameter
         const response = await addon.client.get('catalog', 'search', '', { search: query });
         return response && response.metas ? response.metas : [];
       } catch (error) {
         console.error(`❌ Error searching in ${addon.manifest.name}:`, error);
         return [];
       }
     })
   );
   
   // Combine results from all addons
   const allMetas = results
     .filter(result => result.status === 'fulfilled')
     .flatMap(result => result.value);
   
   // Remove duplicates based on id
   const uniqueMetas = Array.from(
     new Map(allMetas.map(meta => [meta.id, meta])).values()
   );
   
   const response = { metas: uniqueMetas };
   
   console.log(`📊 Total search results from external addons: ${uniqueMetas.length}`);
   return response;
 }

 /**
  * Get item from cache if not expired
   * @param {string} key - Cache key
   * @returns {object|null} - Cached item or null if not found or expired
   */
  getFromCache(key) {
    if (!this.cache.has(key)) {
      return null;
    }
    
    const { timestamp, data } = this.cache.get(key);
    const now = Date.now();
    
    if (now - timestamp > this.cacheExpiration) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }
    
    return data;
  }

  /**
   * Set item in cache with current timestamp
   * @param {string} key - Cache key
   * @param {object} data - Data to cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      timestamp: Date.now(),
      data
    });
  }

  /**
   * Clear the entire cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Addon client cache cleared');
  }
}

// Create and export a singleton instance
const addonClientInstance = new StremioAddonClient();
module.exports = addonClientInstance;