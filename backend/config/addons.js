/**
 * Stremio Addon Configuration
 * This file contains the configuration for Stremio addons used by the CRMB application.
 */

module.exports = {
  addons: [
    {
      id: 'cinemeta',
      name: 'Cinemeta',
      url: 'https://v3-cinemeta.strem.io/manifest.json',
      description: 'Basic metadata for movies and series',
      resources: ['catalog', 'meta'],
      types: ['movie', 'series'],
      enabled: true
    },
    {
      id: 'torrentio',
      name: 'Torrentio',
      url: 'https://torrentio.strem.fun/manifest.json',
      description: 'Torrent streaming from various sources',
      resources: ['stream'],
      types: ['movie', 'series', 'anime'],
      enabled: true
    },
    {
      id: 'opensubtitles',
      name: 'OpenSubtitles',
      url: 'https://opensubtitles-v3.strem.io/manifest.json',
      description: 'Subtitle addon for movies and series',
      resources: ['subtitles'],
      types: ['movie', 'series'],
      enabled: true
    },
    // Note: YouTube trailer addon removed due to URL issues
    // Focus on core functionality with working addons
    // Additional addons can be added here
  ]
};