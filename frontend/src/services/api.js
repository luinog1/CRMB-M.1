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
    console.log('🔍 API Request:', endpoint, options.method || 'GET');
    
    try {
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', {
        endpoint,
        url,
        error: error.message
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
  
  // Simplified content API endpoints - using new backend API

  // Get catalog content by type and category
  async getCatalog(type = 'movie', category = 'top') {
    console.log('🔍 getCatalog called:', { type, category });
    try {
      const result = await this.request(`/content/discover/${type}/${category}`);
      console.log('🔍 getCatalog result:', result);
      // Return the data array directly for backward compatibility
      return result.success ? result.data : [];
    } catch (error) {
      console.error('❌ getCatalog error:', error);
      // Return empty array as fallback to maintain compatibility
      return [];
    }
  }

  // Get metadata for a specific item
  async getMetadata(id, type = 'movie') {
    console.log('🔍 getMetadata called:', { id, type });
    try {
      const result = await this.request(`/content/meta/${id}?type=${type}`);
      console.log('🔍 getMetadata result:', result);
      // Return the data directly for backward compatibility
      return result.success ? result.data : null;
    } catch (error) {
      console.error('❌ getMetadata error:', error);
      return null;
    }
  }

  // Get streams for a specific item
  async getStreams(id, type = 'movie') {
    console.log('🔍 getStreams called:', { id, type });
    try {
      const result = await this.request(`/content/stream/${id}?type=${type}`);
      console.log('🔍 getStreams result:', result);
      // Return the data array directly for backward compatibility
      return result.success ? result.data : [];
    } catch (error) {
      console.error('❌ getStreams error:', error);
      // Return empty array as fallback to maintain compatibility
      return [];
    }
  }

  // Search for content
  async search(query, type = 'multi') {
    if (!query) {
      throw new Error('Search query is required');
    }

    console.log('🔍 search called:', { query, type });
    try {
      // Try multiple search approaches for better results

      // 1. First try the content search endpoint with type parameter
      let result = await this.request(`/content/search/${encodeURIComponent(query)}?type=${type}`);
      console.log('🔍 content search result:', result);

      let searchResults = [];
      if (result.success && result.data && result.data.length > 0) {
        searchResults = result.data;
      } else {
        // 2. If no results, try TMDB search as fallback
        try {
          const tmdbResult = await this.request(`/tmdb/search?query=${encodeURIComponent(query)}&type=${type}&page=1`);
          if (tmdbResult.success && tmdbResult.data) {
            searchResults = tmdbResult.data;
          }
        } catch (tmdbError) {
          console.warn('TMDB search fallback failed:', tmdbError);
        }
      }

      // 3. Normalize and enhance results with metadata
      const normalizedResults = await Promise.all(searchResults.map(async (item) => {
        try {
          // Try to get additional metadata for better search results
          if (item.id && item.type) {
            const metadata = await this.request(`/content/meta/${item.id}?type=${item.type}`).catch(() => null);
            if (metadata && metadata.success && metadata.data) {
              return {
                ...item,
                ...metadata.data,
                title: metadata.data.title || metadata.data.name || item.title || item.name || 'Unknown Title',
                description: metadata.data.description || metadata.data.overview || metadata.data.plot || item.description || item.overview || item.plot || '',
                poster: metadata.data.poster || metadata.data.posterShape || item.poster || item.posterShape || '',
                background: metadata.data.background || metadata.data.logo || item.background || item.logo || '',
                year: metadata.data.year || metadata.data.releaseInfo?.split('-')?.[0] || item.year || item.releaseInfo?.split('-')?.[0] || '2024',
                rating: String(metadata.data.imdbRating || metadata.data.rating || item.imdbRating || item.rating || '7.0'),
                genre: Array.isArray(metadata.data.genre) ? metadata.data.genre[0] : (metadata.data.genre || item.genre || 'Unknown'),
                type: metadata.data.type || item.type || 'movie'
              };
            }
          }
        } catch (metaError) {
          console.warn('Failed to get metadata for item:', item.id, metaError);
        }

        // Return normalized item without additional metadata
        return {
          ...item,
          title: item.title || item.name || 'Unknown Title',
          id: item.id || `unknown-${Math.random().toString(36).substring(7)}`,
          type: item.type || type || 'movie',
          description: item.description || item.overview || item.plot || '',
          poster: item.poster || item.posterShape || '',
          background: item.background || item.logo || '',
          year: item.year || item.releaseInfo?.split('-')?.[0] || '2024',
          rating: String(item.imdbRating || item.rating || '7.0'),
          genre: Array.isArray(item.genre) ? item.genre[0] : (item.genre || 'Unknown')
        };
      }));

      console.log('🔍 normalized search results:', normalizedResults.length, 'items');
      return normalizedResults;
    } catch (error) {
      console.error('❌ search error:', error);
      // Return empty array as fallback to maintain compatibility
      return [];
    }
  }
  

  // Simplified library methods using new backend API
  async getLibrary() {
    try {
      console.log('📚 getLibrary called');

      // Try to get library from local storage first for quick access
      const localLibrary = localStorage.getItem('user_library');
      if (localLibrary) {
        const parsed = JSON.parse(localLibrary);
        console.log('✅ Returning cached library with', parsed.length, 'items');
        return parsed;
      }

      // Get content from multiple sources via the simplified API
      const [movies, series] = await Promise.all([
        this.getCatalog('movie', 'top'),
        this.getCatalog('series', 'top')
      ]);

      const allContent = [
        ...movies.map(item => ({ ...item, type: 'movie' })),
        ...series.map(item => ({ ...item, type: 'series' }))
      ];

      console.log('📊 Total library content loaded:', allContent.length);

      // Cache the library for future use
      if (allContent.length > 0) {
        localStorage.setItem('user_library', JSON.stringify(allContent));
        console.log('💾 Saved library to local storage');
      }

      return allContent;
    } catch (error) {
      console.error('❌ Error fetching library:', error);
      // Return empty array as fallback to maintain compatibility
      return [];
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

  // Addon management methods
  async getAddons() {
    console.log('🔍 getAddons called');
    try {
      const result = await this.request('/addons');
      console.log('🔍 getAddons result:', result);
      // Return the addons array directly for backward compatibility
      return result.success ? result : { addons: [] };
    } catch (error) {
      console.error('❌ getAddons error:', error);
      // Return empty array as fallback to maintain compatibility
      return { addons: [] };
    }
  }

  async getAvailableAddons() {
    console.log('🔍 getAvailableAddons called');
    try {
      const result = await this.request('/addons/available');
      console.log('🔍 getAvailableAddons result:', result);
      // Return the addons array directly for backward compatibility
      return result.success ? result.addons : [];
    } catch (error) {
      console.error('❌ getAvailableAddons error:', error);
      // Return empty array as fallback to maintain compatibility
      return [];
    }
  }

  async installAddon(url) {
    console.log('🔍 installAddon called:', { url });
    try {
      const result = await this.request('/addons', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      console.log('🔍 installAddon result:', result);
      // Return the addon directly for backward compatibility
      return result.success ? { addon: result.addon } : null;
    } catch (error) {
      console.error('❌ installAddon error:', error);
      throw error;
    }
  }

  async syncAddons() {
    console.log('🔍 syncAddons called');
    try {
      // For now, sync by refreshing addons from the backend
      // This could be enhanced to sync content as well
      const result = await this.request('/addons');
      console.log('🔍 syncAddons result:', result);
      // Return the addons array directly for backward compatibility
      return result.success ? result.addons : [];
    } catch (error) {
      console.error('❌ syncAddons error:', error);
      // Return empty array as fallback to maintain compatibility
      return [];
    }
  }

  async syncLibraryContent() {
    console.log('🔍 syncLibraryContent called');
    try {
      // This is a placeholder - the actual sync functionality
      // would depend on what content needs to be synced
      // For now, just trigger a refresh of the library
      const result = await this.getLibrary();
      console.log('🔍 syncLibraryContent result:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('❌ syncLibraryContent error:', error);
      throw error;
    }
  }
}

export default new ApiService();