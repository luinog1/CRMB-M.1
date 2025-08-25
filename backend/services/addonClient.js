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

       // Clear cache on initialization to ensure fresh data
       this.clearCache();
       console.log('🧹 Cache cleared on initialization');

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

      // First try to get manifest through our proxy endpoint
      const axios = require('axios');
      const manifestResponse = await axios.get(`http://localhost:3001/api/manifest/proxy?url=${encodeURIComponent(url)}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'CRMB/1.0'
        }
      });

      const manifest = manifestResponse.data;

      if (manifest && manifest.id) {
        // Ensure manifest has a URL (fallback to the provided URL if not set)
        if (!manifest.url) {
          console.warn(`⚠️ Manifest for ${manifest.name} missing URL, using provided URL: ${url}`);
          manifest.url = url.replace('/manifest.json', '');
        }

        // Create a mock addon object with the manifest
        const addon = {
          manifest: manifest,
          get: async (resource, type, id, extra = {}) => {
            // Use manifest.url if available, otherwise fallback to the original URL
            const addonBaseUrl = manifest.url || url.replace('/manifest.json', '');
            console.log(`🔍 Using addon base URL: ${addonBaseUrl} for ${resource}/${type}/${id}`);

            try {
              if (resource === 'catalog') {
                const response = await axios.get(`${addonBaseUrl}/catalog/${type}/${id}.json`, {
                  params: extra,
                  maxRedirects: 5,
                  timeout: 10000
                });
                return response.data || { metas: [] };
              } else if (resource === 'meta') {
                const response = await axios.get(`${addonBaseUrl}/meta/${type}/${id}.json`, {
                  maxRedirects: 5,
                  timeout: 10000
                });
                return response.data || { meta: null };
              } else if (resource === 'stream') {
                const response = await axios.get(`${addonBaseUrl}/stream/${type}/${id}.json`, {
                  maxRedirects: 5,
                  timeout: 10000
                });
                return response.data || { streams: [] };
              }
              return {};
            } catch (error) {
              console.error(`❌ Error making addon request to ${addonBaseUrl}/${resource}/${type}/${id}.json:`, error.message);
              if (error.response) {
                console.error(`Response status: ${error.response.status}`);
                console.error(`Response headers:`, error.response.headers);
                console.error(`Response data:`, error.response.data);
              }
              return resource === 'catalog' ? { metas: [] } :
                     resource === 'meta' ? { meta: null } :
                     resource === 'stream' ? { streams: [] } : {};
            }
          }
        };

        // Store the addon instance with enhanced manifest
        this.addons.set(manifest.id, {
          manifest: manifest,
          client: addon
        });

        console.log(`✅ Loaded addon: ${manifest.name} (${manifest.id}) with URL: ${manifest.url}`);
        return addon;
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
    console.log(`🔍 getAddons called, current addons in Map: ${this.addons.size}`);
    this.addons.forEach((addon, id) => {
      console.log(`🔍 Loaded addon: ${id} - ${addon.manifest.name}`);
    });
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
    console.log(`🔍 Adding addon from URL: ${url}`);
    
    try {
      // First validate the addon using our proxy
      const axios = require('axios');
      const validationResponse = await axios.get(`http://localhost:3001/api/manifest/validate?url=${encodeURIComponent(url)}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'CRMB/1.0'
        }
      });
      
      if (validationResponse.data.success && validationResponse.data.validation.valid) {
        const manifest = validationResponse.data.validation.manifest;
        
        // Check if this addon is already in the config
        const existingAddon = addonsConfig.addons.find(a => a.id === manifest.id);
        
        if (!existingAddon) {
          // Add to config for persistence
          addonsConfig.addons.push({
            id: manifest.id,
            name: manifest.name,
            url: url,
            description: manifest.description || '',
            resources: manifest.resources || [],
            types: manifest.types || [],
            enabled: true
          });
        }
        
        // Create a mock addon object with the correct implementation
        const addon = {
          manifest: manifest,
          get: async (resource, type, id, extra = {}) => {
            // Implement addon client methods by proxying to external addon URLs
            const addonBaseUrl = manifest.url || url;
            try {
              if (resource === 'catalog') {
                const response = await axios.get(`${addonBaseUrl}/catalog/${type}/${id}.json`, {
                  params: extra,
                  maxRedirects: 5,
                  timeout: 10000
                });
                return response.data || { metas: [] };
              } else if (resource === 'meta') {
                const response = await axios.get(`${addonBaseUrl}/meta/${type}/${id}.json`, {
                  maxRedirects: 5,
                  timeout: 10000
                });
                return response.data || { meta: null };
              } else if (resource === 'stream') {
                const response = await axios.get(`${addonBaseUrl}/stream/${type}/${id}.json`, {
                  maxRedirects: 5,
                  timeout: 10000
                });
                return response.data || { streams: [] };
              }
              return {};
            } catch (error) {
              console.error(`❌ Error making addon request to ${addonBaseUrl}/catalog/${type}/${id}.json:`, error.message);
              if (error.response) {
                console.error(`Response status: ${error.response.status}`);
                console.error(`Response headers:`, error.response.headers);
                console.error(`Response data:`, error.response.data);
              }
              return resource === 'catalog' ? { metas: [] } :
                     resource === 'meta' ? { meta: null } :
                     resource === 'stream' ? { streams: [] } : {};
            }
          }
        };
        
        // Store the addon instance
        this.addons.set(manifest.id, {
          manifest: manifest,
          client: addon
        });
        
        console.log(`✅ Added addon: ${manifest.name} (${manifest.id})`);
        return addon.manifest;
      } else {
        throw new Error('Addon validation failed');
      }
    } catch (error) {
      console.error(`❌ Failed to add addon from ${url}:`, error);
      throw error;
    }
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
      console.log(`⚠️ No addons support catalog ${type}/${id}`);
      return { metas: [] };
    }

    const cacheKey = `catalog:${type}:${id}:${JSON.stringify(extra)}`;

    // Check cache first, but skip if nocache is requested
    const skipCache = extra.nocache === '1' || extra.nocache === 1 || extra.nocache === true;
    let cachedResult = null;

    console.log(`🔍 Cache handling: skipCache=${skipCache}, cacheKey=${cacheKey}`);

    if (!skipCache) {
      cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        console.log(`🔄 Returning cached catalog for ${cacheKey}`);
        return cachedResult;
      } else {
        console.log(`🔍 Cache miss for ${cacheKey}, fetching from addons`);
      }
    } else {
      console.log(`🚫 Skipping cache for ${cacheKey} (nocache requested)`);
      // Clear any existing cache for this key when nocache is requested
      if (this.cache.has(cacheKey)) {
        console.log(`🗑️ Deleting existing cache entry for ${cacheKey}`);
        this.cache.delete(cacheKey);
      }
      // Force clear all catalog caches to ensure fresh data
      console.log(`🧹 Force clearing all catalog caches`);
      this.clearCachePattern('catalog:');
    }

    // Map requested catalog IDs to available ones in addons
    const mappedId = this.mapCatalogId(id);
    console.log(`🔍 Mapped catalog ID: ${id} -> ${mappedId}`);

    // Log addon details for debugging
    supportingAddons.forEach((addon, index) => {
      const addonBaseUrl = addon.manifest.url || addonsConfig.addons.find(a => a.id === addon.manifest.id)?.url || 'no url';
      console.log(`🔍 Addon ${index + 1}: ${addon.manifest.name} (${addonBaseUrl})`);
      console.log(`🔍 Addon ${index + 1} manifest URL: ${addon.manifest.url || 'undefined'}`);
      console.log(`🔍 Addon ${index + 1} config URL: ${addonsConfig.addons.find(a => a.id === addon.manifest.id)?.url || 'undefined'}`);
    });

    // Collect results from all supporting addons
    const results = await Promise.allSettled(
      supportingAddons.map(async (addon) => {
        try {
          console.log(`🔍 Making request to ${addon.manifest.name} for catalog/${type}/${mappedId}`);
          const response = await addon.client.get('catalog', type, mappedId, extra);
          console.log(`✅ Response from ${addon.manifest.name}:`, response ? `${response.metas?.length || 0} items` : 'null');
          return response && response.metas ? response.metas : [];
        } catch (error) {
          console.error(`❌ Error getting catalog from ${addon.manifest.name}:`, error.message);
          console.error(`❌ Full error:`, error);
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

    // Cache the results if not skipping cache
    if (!skipCache) {
      this.setCache(cacheKey, response);
    }

    console.log(`📊 Total items from external addons: ${uniqueMetas.length}`);
    return response;
  }

  /**
   * Map catalog IDs to available ones in addons
   * @param {string} requestedId - The requested catalog ID
   * @returns {string} - The mapped catalog ID
   */
  mapCatalogId(requestedId) {
    const idMapping = {
      'trending': 'top',
      'popular': 'top',
      'new': 'year',
      'featured': 'imdbRating'
    };

    return idMapping[requestedId] || requestedId;
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

   // Find addons that support catalog (most addons don't explicitly support search)
   const supportingAddons = Array.from(this.addons.values()).filter(item => {
     return item.manifest.resources.some(resource =>
       typeof resource === 'string' ? resource === 'catalog' :
       resource.name === 'catalog'
     );
   });

   console.log(`📊 Found ${supportingAddons.length} addons supporting catalog search`);

   if (supportingAddons.length === 0) {
     console.log('⚠️ No addons support catalog search');
     return { metas: [] };
   }

   // Collect results from all supporting addons
   const results = await Promise.allSettled(
     supportingAddons.map(async (addon) => {
       try {
         console.log(`🔍 Searching in ${addon.manifest.name}...`);
         // Try different search approaches since most addons don't support search directly

         // 1. Try catalog search with search parameter
         try {
           const response = await addon.client.get('catalog', 'search', '', { search: query });
           if (response && response.metas && response.metas.length > 0) {
             console.log(`✅ Found ${response.metas.length} results from ${addon.manifest.name} (catalog search)`);
             return response.metas;
           }
         } catch (catalogSearchError) {
           console.log(`⚠️ Catalog search not supported by ${addon.manifest.name}, trying alternative approaches...`);
         }

         // 2. Try to search through existing catalog data (this is a fallback)
         try {
           // Get popular/trending content and filter by query
           const popularResponse = await addon.client.get('catalog', 'movie', 'top');
           if (popularResponse && popularResponse.metas) {
             const filteredResults = popularResponse.metas.filter(item =>
               item.name && item.name.toLowerCase().includes(query.toLowerCase())
             );
             if (filteredResults.length > 0) {
               console.log(`✅ Found ${filteredResults.length} filtered results from ${addon.manifest.name} (filtered popular)`);
               return filteredResults;
             }
           }
         } catch (filterError) {
           console.log(`⚠️ Could not filter existing content from ${addon.manifest.name}`);
         }

         // 3. Return empty array if no search method works
         return [];
       } catch (error) {
         console.log(`⚠️ Search failed for ${addon.manifest.name}:`, error.message);
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
   console.log(`🔍 Checking cache for key: ${key}`);
   console.log(`🔍 Cache contains ${this.cache.size} entries`);

   if (!this.cache.has(key)) {
     console.log(`🔍 Cache miss: key not found`);
     return null;
   }

   const { timestamp, data } = this.cache.get(key);
   const now = Date.now();

   if (now - timestamp > this.cacheExpiration) {
     // Cache expired
     console.log(`🔍 Cache expired: ${key} (age: ${now - timestamp}ms)`);
     this.cache.delete(key);
     return null;
   }

   console.log(`🔍 Cache hit: ${key} (age: ${now - timestamp}ms)`);
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

  /**
   * Clear cache for a specific key pattern
   * @param {string} pattern - Pattern to match cache keys
   */
  clearCachePattern(pattern) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }
}

// Create and export a singleton instance
const addonClientInstance = new StremioAddonClient();
module.exports = addonClientInstance;