/**
 * API service for communicating with the CRUMBLE BFF server
 */

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Fetch data from the API with error handling
 * @param {string} endpoint - The API endpoint to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 */
async function fetchFromApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * TMDB API service
 */
export const tmdbApi = {
  /**
   * Get trending content
   * @returns {Promise<any>} - Trending content data
   */
  getTrending: () => fetchFromApi('/tmdb/trending'),

  /**
   * Get new releases
   * @returns {Promise<any>} - New releases data
   */
  getNewReleases: () => fetchFromApi('/tmdb/new-releases'),
};

/**
 * Trakt API service
 */
export const traktApi = {
  /**
   * Get user watchlist
   * @returns {Promise<any>} - User watchlist data
   */
  getWatchlist: () => fetchFromApi('/trakt/watchlist'),
};

/**
 * Stremio API service
 */
export const stremioApi = {
  /**
   * Get streaming sources for content
   * @param {string} type - Content type (movie, series)
   * @param {string} id - Content ID
   * @returns {Promise<any>} - Streaming sources data
   */
  getSources: (type, id) => fetchFromApi(`/stremio/sources/${type}/${id}`),
};

/**
 * Health check
 */
export const healthCheck = () => fetchFromApi('/health');

export default {
  tmdbApi,
  traktApi,
  stremioApi,
  healthCheck,
};