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
      id: 'crmb-addon',
      name: 'CRMB Addon',
      url: `${process.env.BASE_URL || 'http://localhost:3001'}/manifest.json`,
      description: 'Content discovery and streaming addon for CRMB',
      resources: ['catalog', 'meta', 'stream'],
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
      id: 'orion',
      name: 'Orion',
      url: 'https://api.orionoid.com/manifest.json',
      description: 'Premium streaming links aggregator',
      resources: ['stream'],
      types: ['movie', 'series'],
      enabled: true
    },
    {
      id: 'jackettio',
      name: 'Jackettio',
      url: 'https://jackettio.strem.fun/manifest.json',
      description: 'Jackett indexer integration',
      resources: ['stream'],
      types: ['movie', 'series'],
      enabled: true
    }
    // Additional addons can be added here
  ]
};