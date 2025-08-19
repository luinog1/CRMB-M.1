/**
 * Addon Service
 * This service creates a Stremio addon using the official stremio-addon-sdk.
 */

const { addonBuilder } = require('stremio-addon-sdk');
const manifest = require('../manifest');
const addonClient = require('./addonClient');

class AddonService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.builder = new addonBuilder(manifest);
    this.initialize();
  }

  async initialize() {
    console.log('🔄 Initializing AddonService with stremio-addon-sdk...');
    
    // Initialize the addon client
    await addonClient.initialize();
    
    // Define catalog handler
    this.builder.defineCatalogHandler(this.getCatalog.bind(this));
    
    // Define meta handler
    this.builder.defineMetaHandler(this.getMeta.bind(this));
    
    // Define stream handler
    this.builder.defineStreamHandler(this.getStreams.bind(this));
    
    // Get the addon interface
    this.addon = this.builder.getInterface();
    
    console.log('✅ AddonService initialization complete');
  }

  async getCatalog(args) {
    const { type, id, extra } = args;
    console.log(`🔍 getCatalog request: type=${type}, id=${id}`, extra || {});
    
    const cacheKey = `catalog:${type}:${id}:${JSON.stringify(extra || {})}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`🔄 Returning cached catalog for ${cacheKey}`);
      return this.cache.get(cacheKey);
    }
    
    // Try to get catalog from external addons first
    try {
      const externalResults = await addonClient.getCatalog(args);
      
      if (externalResults && externalResults.metas && externalResults.metas.length > 0) {
        console.log(`📊 Found ${externalResults.metas.length} items from external addons`);
        
        // Cache the results
        this.cache.set(cacheKey, externalResults);
        
        return externalResults;
      }
    } catch (error) {
      console.error('❌ Error fetching catalog from external addons:', error);
    }
    
    console.log('⚠️ No results from external addons, falling back to mock data');
    
    // Fall back to mock data
    const mockData = {
      metas: [
        {
          id: 'tt0111161',
          type: 'movie',
          name: 'The Shawshank Redemption',
          poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
          background: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
          description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
          releaseInfo: '1994',
          imdbRating: 9.3,
          runtime: '142 min'
        },
        {
          id: 'tt0068646',
          type: 'movie',
          name: 'The Godfather',
          poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
          background: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
          description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
          releaseInfo: '1972',
          imdbRating: 9.2,
          runtime: '175 min'
        }
      ]
    };
    
    // Cache the results
    this.cache.set(cacheKey, mockData);
    
    console.log(`📊 Total mock items: ${mockData.metas.length}`);
    return mockData;
  }

  async getMeta(args) {
    const { type, id } = args;
    console.log(`🔍 getMeta request: type=${type}, id=${id}`);
    
    const cacheKey = `meta:${type}:${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`🔄 Returning cached metadata for ${cacheKey}`);
      return this.cache.get(cacheKey);
    }
    
    // Try to get metadata from external addons first
    try {
      const externalResult = await addonClient.getMeta(args);
      
      if (externalResult && externalResult.meta) {
        console.log(`📊 Found metadata from external addon for ${type}/${id}`);
        
        // Cache the results
        this.cache.set(cacheKey, externalResult);
        
        return externalResult;
      }
    } catch (error) {
      console.error('❌ Error fetching metadata from external addons:', error);
    }
    
    console.log('⚠️ No metadata from external addons, falling back to mock data');
    
    // Fall back to mock data
    const mockData = {
      meta: {
        id: id,
        type: type,
        name: type === 'movie' ? 'Mock Movie' : 'Mock Series',
        poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
        background: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
        description: 'Mock description for ' + id,
        releaseInfo: '2024',
        imdbRating: 8.5,
        runtime: '120 min'
      }
    };
    
    // Cache the results
    this.cache.set(cacheKey, mockData);
    
    return mockData;
  }

  async getStreams(args) {
    const { type, id } = args;
    console.log(`🔍 getStreams request: type=${type}, id=${id}`);
    
    const cacheKey = `streams:${type}:${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`🔄 Returning cached streams for ${cacheKey}`);
      return this.cache.get(cacheKey);
    }
    
    // Try to get streams from external addons first
    try {
      const externalResults = await addonClient.getStreams(args);
      
      if (externalResults && externalResults.streams && externalResults.streams.length > 0) {
        console.log(`📊 Found ${externalResults.streams.length} streams from external addons`);
        
        // Cache the results
        this.cache.set(cacheKey, externalResults);
        
        return externalResults;
      }
    } catch (error) {
      console.error('❌ Error fetching streams from external addons:', error);
    }
    
    console.log('⚠️ No streams from external addons, falling back to mock data');
    
    // Fall back to mock data
    const mockData = {
      streams: [
        {
          name: 'Mock Stream 1',
          url: 'https://example.com/stream1',
          title: 'HD Stream'
        },
        {
          name: 'Mock Stream 2',
          url: 'https://example.com/stream2',
          title: '4K Stream'
        }
      ]
    };
    
    // Cache the results
    this.cache.set(cacheKey, mockData);
    
    console.log(`📊 Total mock streams: ${mockData.streams.length}`);
    return mockData;
  }

  getAddon() {
    return this.addon;
  }

  clearCache() {
    this.cache.clear();
    addonClient.clearCache();
    console.log('🧹 Cache cleared');
  }
  
  /**
   * Get the list of available external addons
   * @returns {Array} - Array of addon manifests
   */
  getExternalAddons() {
    return addonClient.getAddons();
  }
  
  /**
   * Add a new external addon by URL
   * @param {string} url - The URL of the addon manifest
   * @returns {Promise<object|null>} - The added addon or null if failed
   */
  async addExternalAddon(url) {
    return addonClient.addAddon(url);
  }
  
  /**
   * Remove an external addon by ID
   * @param {string} id - The ID of the addon to remove
   * @returns {boolean} - Whether the addon was removed
   */
  removeExternalAddon(id) {
    return addonClient.removeAddon(id);
  }
  
  /**
   * Enable or disable an external addon
   * @param {string} id - The ID of the addon
   * @param {boolean} enabled - Whether to enable or disable
   * @returns {boolean} - Success status
   */
  setExternalAddonStatus(id, enabled) {
    return addonClient.setAddonStatus(id, enabled);
  }
}

module.exports = AddonService;