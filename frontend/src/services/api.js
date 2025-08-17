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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // TMDB endpoints
  async getTrending() {
    return this.request('/tmdb/trending');
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
  
  // Stremio endpoints - Enhanced with proper protocol support
  async getStreamingSources(type, id, addons = null) {
    if (!addons) {
      // Use default addons if none specified
      addons = 'https://torrentio.strem.io';
    }
    return this.request(`/stremio/sources/${type}/${id}?addons=${addons}`);
  }
  
  async getStremioAddons() {
    return this.request('/stremio/addons');
  }
  
  async getStremioMetadata(type, imdbId) {
    return this.request(`/stremio/meta/${type}/${imdbId}`);
  }
  
  async getStremioMetadataByTmdb(type, tmdbId) {
    return this.request(`/stremio/meta-by-tmdb/${type}/${tmdbId}`);
  }

  // New Stremio catalog endpoints
  async getStremioCatalog(addonId, type, catalogId, options = {}) {
    const { skip = 0, limit = 20, genre, search, sort } = options;
    let url = `/stremio/addon/${addonId}/catalog/${type}/${catalogId}`;
    
    const params = new URLSearchParams();
    if (skip > 0) params.append('skip', skip);
    if (limit !== 20) params.append('limit', limit);
    if (genre) params.append('genre', genre);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
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
    return this.request('/stremio/install-addon', {
      method: 'POST',
      body: JSON.stringify({ addonUrl })
    });
  }

  async getAddonManifest(addonId) {
    return this.request(`/stremio/addon/${addonId}/manifest`);
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