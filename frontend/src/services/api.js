const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.apiKeys = {
      tmdb: localStorage.getItem('tmdb_api_key') || '',
      trakt: {
        clientId: localStorage.getItem('trakt_client_id') || '',
        accessToken: localStorage.getItem('trakt_access_token') || ''
      },
      mdblist: localStorage.getItem('mdblist_api_key') || ''
    };
    
    this.playerPreferences = {
      defaultPlayer: localStorage.getItem('default_player') || 'internal',
      externalPlayers: JSON.parse(localStorage.getItem('external_players') || '[]')
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add API keys to headers if available
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.apiKeys.tmdb) {
      headers['X-TMDB-API-Key'] = this.apiKeys.tmdb;
    }
    
    if (this.apiKeys.trakt.clientId) {
      headers['X-Trakt-Client-ID'] = this.apiKeys.trakt.clientId;
    }
    
    if (this.apiKeys.trakt.accessToken) {
      headers['X-Trakt-Auth'] = this.apiKeys.trakt.accessToken;
    }
    
    if (this.apiKeys.mdblist) {
      headers['X-MDbList-API-Key'] = this.apiKeys.mdblist;
    }
    
    // Debug logging for API requests
    console.group('🔍 API Request Debug');
    console.log('📍 Endpoint:', endpoint);
    console.log('🔗 Full URL:', url);
    console.log('⚙️  Options:', {
      method: options.method || 'GET',
      headers: Object.keys(headers).reduce((acc, key) => {
        // Don't log sensitive API keys
        if (key.includes('API-Key') || key.includes('Auth')) {
          acc[key] = '[REDACTED]';
        } else {
          acc[key] = headers[key];
        }
        return acc;
      }, {}),
      body: options.body ? JSON.parse(options.body) : 'No body'
    });
    console.groupEnd();
    
    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      // Debug logging for API responses
      console.group('📤 API Response Debug');
      console.log('📍 Endpoint:', endpoint);
      console.log('📊 Status:', response.status);
      console.log('✅ OK:', response.ok);
      console.groupEnd();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', {
        endpoint,
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // TMDB endpoints
  async getTrending(mediaType = 'movie', timeWindow = 'week') {
    return this.request(`/tmdb/trending/${mediaType}/${timeWindow}`);
  }

  async getNewReleases() {
    return this.request('/tmdb/new-releases');
  }

  // Search functionality
  async searchContent(query, type = 'multi', page = 1) {
    return this.request(`/tmdb/search?query=${encodeURIComponent(query)}&type=${type}&page=${page}`);
  }
  
  // Trakt endpoints
  async traktAuth() {
    return this.request('/trakt/auth');
  }
  
  async traktCallback(code) {
    return this.request('/trakt/callback', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }
  
  async getTraktWatchlist() {
    return this.request('/trakt/watchlist');
  }
  
  async addToTraktWatchlist(item) {
    return this.request('/trakt/watchlist', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }
  
  // MDbList endpoints
  async getMDbListItems() {
    return this.request('/mdblist/items');
  }
  
  async addToMDbList(item) {
    return this.request('/mdblist/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }
  
  // Stremio endpoints - Updated to use new backend API
  async getStremioAddons() {
    return this.request('/api/stremio/addons');
  }
  
  // Get catalog from Stremio addons
  async getStremioCatalog(type, id, options = {}) {
    const { skip, limit, genre, search } = options;
    let url = `/api/stremio/catalog/${type}/${id}`;
    
    const params = new URLSearchParams();
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);
    if (genre) params.append('genre', genre);
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }
  
  // Get metadata for a specific item
  async getStremioMetadata(type, id) {
    console.log('🔍 DEBUG: Frontend API - getStremioMetadata called:', { type, id });
    try {
      const result = await this.request(`/api/stremio/meta/${type}/${id}`);
      console.log('🔍 DEBUG: Frontend API - getStremioMetadata result:', result);
      return result;
    } catch (error) {
      console.error('❌ DEBUG: Frontend API - getStremioMetadata error:', error);
      throw error;
    }
  }
  
  // Get streams for a specific item
  async getStremioStreams(type, id) {
    console.log('🔍 DEBUG: Frontend API - getStremioStreams called:', { type, id });
    try {
      const result = await this.request(`/api/stremio/stream/${type}/${id}`);
      console.log('🔍 DEBUG: Frontend API - getStremioStreams result:', result);
      return result;
    } catch (error) {
      console.error('❌ DEBUG: Frontend API - getStremioStreams error:', error);
      throw error;
    }
  }
  
  // Search for content
  async stremioSearch(type, query) {
    if (!query) {
      throw new Error('Search query is required');
    }
    
    return this.request(`/stremio/search/${type}?query=${encodeURIComponent(query)}`);
  }
  
  // Legacy methods for backward compatibility
  async getStreamingSources(type, id) {
    console.warn('getStreamingSources is deprecated, use getStremioStreams instead');
    return this.getStremioStreams(type, id);
  }
  
  async getStremioMetadataByTmdb(type, tmdbId) {
    console.warn('getStremioMetadataByTmdb is deprecated, use getStremioMetadata instead');
    // This is a fallback that might not work with the new API
    // The new API expects Stremio IDs, not TMDB IDs
    return this.request(`/stremio/meta/${type}/${tmdbId}`);
  }

  // User library methods
  async getUserLibrary() {
    try {
      console.group('📚 API Debug - getUserLibrary');
      
      // Try to get user library from local storage first
      const localLibrary = localStorage.getItem('user_library');
      console.log('💾 Local storage library:', localLibrary ? JSON.parse(localLibrary) : 'Not found');
      
      if (localLibrary) {
        const parsed = JSON.parse(localLibrary);
        console.log('✅ Returning local library with', parsed.length, 'items');
        console.groupEnd();
        return parsed;
      }
      
      // Try to get from addon catalogs
      console.log('🔍 Attempting to load from addon catalogs...');
      const addons = await this.getAddons();
      console.log('📦 Available addons:', addons.length);
      
      let allContent = [];
      
      for (const addon of addons) {
        if (addon.enabled) {
          console.log(`🔄 Loading from addon: ${addon.name} (${addon.id})`);
          try {
            // Try to get movie catalog
            const movieCatalog = await this.getAddonCatalog(addon.id, 'movie', 'top');
            console.log(`📽️  Movies from ${addon.name}:`, movieCatalog?.metas?.length || 0);
            if (movieCatalog?.metas) {
              allContent = [...allContent, ...movieCatalog.metas.map(item => ({
                ...item,
                type: 'movie',
                source: addon.name
              }))];
            }
            
            // Try to get series catalog
            const seriesCatalog = await this.getAddonCatalog(addon.id, 'series', 'top');
            console.log(`📺 Series from ${addon.name}:`, seriesCatalog?.metas?.length || 0);
            if (seriesCatalog?.metas) {
              allContent = [...allContent, ...seriesCatalog.metas.map(item => ({
                ...item,
                type: 'series',
                source: addon.name
              }))];
            }
          } catch (error) {
            console.warn(`⚠️ Failed to load from ${addon.name}:`, error.message);
          }
        }
      }
      
      console.log('📊 Total content loaded:', allContent.length);
      console.log('📋 Content sources:', [...new Set(allContent.map(item => item.source))]);
      
      // Save to local storage for next time
      if (allContent.length > 0) {
        localStorage.setItem('user_library', JSON.stringify(allContent));
        console.log('💾 Saved to local storage');
      }
      
      console.groupEnd();
      return allContent;
    } catch (error) {
      console.error('❌ Error fetching user library:', error);
      console.groupEnd();
      return [];
    }
  }

  // Sync addons and load content
  async syncLibraryContent() {
    try {
      console.group('🔄 API Debug - syncLibraryContent');
      
      const addons = await this.getAddons();
      console.log('📦 Available addons for sync:', addons.length);
      
      let allContent = [];
      
      for (const addon of addons) {
        if (addon.enabled) {
          console.log(`🔄 Syncing with addon: ${addon.name} (${addon.id})`);
          try {
            // Get movie catalog
            const movieCatalog = await this.getAddonCatalog(addon.id, 'movie', 'top');
            if (movieCatalog?.metas) {
              allContent = [...allContent, ...movieCatalog.metas.map(item => ({
                ...item,
                type: 'movie',
                source: addon.name
              }))];
            }
            
            // Get series catalog
            const seriesCatalog = await this.getAddonCatalog(addon.id, 'series', 'top');
            if (seriesCatalog?.metas) {
              allContent = [...allContent, ...seriesCatalog.metas.map(item => ({
                ...item,
                type: 'series',
                source: addon.name
              }))];
            }
          } catch (error) {
            console.warn(`⚠️ Failed to sync with ${addon.name}:`, error.message);
          }
        }
      }
      
      console.log('📊 Total content synced:', allContent.length);
      
      // Save to local storage
      localStorage.setItem('user_library', JSON.stringify(allContent));
      console.log('💾 Saved synced content to local storage');
      
      console.groupEnd();
      return allContent;
    } catch (error) {
      console.error('❌ Error syncing addons:', error);
      console.groupEnd();
      return [];
    }
  }

  // Updated Stremio catalog endpoints
  async getAddonCatalog(addonId, type, catalogId, options = {}) {
    try {
      console.group(`🔍 API Debug - getAddonCatalog for ${addonId}`);
      console.log(`📋 Parameters: type=${type}, catalogId=${catalogId}`);
      console.log(`📋 Options:`, options);
      
      // Use the new unified catalog endpoint
      const { skip, limit, genre, search } = options;
      
      // For backward compatibility, we'll map the addon ID to the catalog ID
      // In the new API, we don't specify the addon ID in the URL
      const catalogIdToUse = addonId === 'cinemeta' ? 'top' : catalogId;
      
      console.log(`🔄 Using catalog ID: ${catalogIdToUse}`);
      console.log(`🔄 Calling getStremioCatalog(${type}, ${catalogIdToUse}, ...)`);
      
      const result = await this.getStremioCatalog(type, catalogIdToUse, options);
      
      console.log(`✅ Received ${result.metas?.length || 0} items`);
      console.groupEnd();
      return result;
    } catch (error) {
      console.error(`❌ Error fetching addon catalog for ${addonId}:`, error);
      console.groupEnd();
      throw new Error(`Failed to load catalog from ${addonId}: ${error.message}`);
    }
  }

  async getStremioSubtitles(type, id, options = {}) {
    const { videoID, videoSize } = options;
    let url = `/stremio/subtitles/${type}/${id}`;
    
    const params = new URLSearchParams();
    if (videoID) params.append('videoID', videoID);
    if (videoSize) params.append('videoSize', videoSize);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  // Install and manage addons
  async installAddon(addonUrl) {
    console.group('🔌 API Debug - installAddon');
    console.log(`🔍 Installing addon from URL: ${addonUrl}`);
    
    try {
      // Use the provided URL instead of hardcoding it
      const response = await this.request('/stremio/install-addon', {
        method: 'POST',
        body: JSON.stringify({ addonUrl })
      });
      
      console.log('📋 Installation response:', response);
      console.groupEnd();
      return response;
    } catch (error) {
      console.error('❌ Error installing addon:', error);
      console.groupEnd();
      throw error;
    }
  }

  async getAddonManifest(addonId) {
    return this.request(`/stremio/addon/${addonId}/manifest`);
  }
  
  // Sync addons from backend
  async syncAddons() {
    try {
      console.group('🔄 API Debug - syncAddons');
      console.log('🔄 Fetching updated addons from backend...');
      
      // Call the backend endpoint to sync addons
      const response = await this.request('/api/stremio/addons');
      const addons = response.addons || [];
      
      console.log(`✅ Received ${addons.length} addons from backend`);
      console.groupEnd();
      
      return addons;
    } catch (error) {
      console.error('❌ Error syncing addons:', error);
      console.groupEnd();
      throw new Error(`Failed to sync addons: ${error.message}`);
    }
  }
  
  async getAddons() {
    try {
      const response = await this.request('/api/stremio/addons');
      return response.addons || [];
    } catch (error) {
      console.error('Error fetching addon metadata:', error);
      throw new Error(`Failed to load addons: ${error.message}`);
    }
  }

  async getAvailableAddons() {
    try {
      const response = await this.request('/api/stremio/addons/available');
      return response.addons || [];
    } catch (error) {
      console.error('Error fetching available addons:', error);
      throw new Error(`Failed to load available addons: ${error.message}`);
    }
  }

  async getMovieDetails(tmdbId) {
    return this.request(`/tmdb/movie/${tmdbId}?append_to_response=credits,videos,similar`);
  }
  
  async getTvDetails(tmdbId) {
    return this.request(`/tmdb/tv/${tmdbId}?append_to_response=credits,videos,similar`);
  }
  
  // External player management
  setDefaultPlayer(player) {
    this.playerPreferences.defaultPlayer = player;
    localStorage.setItem('default_player', player);
  }
  
  addExternalPlayer(player) {
    if (!this.playerPreferences.externalPlayers.includes(player)) {
      this.playerPreferences.externalPlayers.push(player);
      localStorage.setItem('external_players', JSON.stringify(this.playerPreferences.externalPlayers));
    }
  }
  
  removeExternalPlayer(player) {
    this.playerPreferences.externalPlayers = this.playerPreferences.externalPlayers.filter(p => p !== player);
    localStorage.setItem('external_players', JSON.stringify(this.playerPreferences.externalPlayers));
  }
  
  getExternalPlayers() {
    return this.playerPreferences.externalPlayers;
  }
  
  // API key management
  setApiKey(service, key) {
    switch(service) {
      case 'tmdb':
        this.apiKeys.tmdb = key;
        localStorage.setItem('tmdb_api_key', key);
        break;
      case 'trakt_client_id':
        this.apiKeys.trakt.clientId = key;
        localStorage.setItem('trakt_client_id', key);
        break;
      case 'mdblist':
        this.apiKeys.mdblist = key;
        localStorage.setItem('mdblist_api_key', key);
        break;
      default:
        break;
    }
  }
  
  setTraktAccessToken(token) {
    this.apiKeys.trakt.accessToken = token;
    localStorage.setItem('trakt_access_token', token);
  }

  // Get current API keys
  getApiKeys() {
    return this.apiKeys;
  }

  // Check if API keys are configured
  hasApiKey(service) {
    switch(service) {
      case 'tmdb':
        return !!this.apiKeys.tmdb;
      case 'trakt':
        return !!(this.apiKeys.trakt.clientId && this.apiKeys.trakt.accessToken);
      case 'mdblist':
        return !!this.apiKeys.mdblist;
      default:
        return false;
    }
  }
}

export default new ApiService();