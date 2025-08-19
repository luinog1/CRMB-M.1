module.exports = {
  id: 'crmb.addon',
  name: 'CRMB Addon',
  version: '1.0.0',
  description: 'Content discovery and streaming addon for CRMB',
  logo: 'https://i.imgur.com/LuQc9tJ.png',
  background: 'https://i.imgur.com/LuQc9tJ.png',
  resources: ['catalog', 'meta', 'stream'],
  types: ['movie', 'series'],
  catalogs: [
    {
      type: 'movie',
      id: 'top',
      name: 'Top Movies',
      extra: [
        { name: 'skip' },
        { name: 'genre' }
      ]
    },
    {
      type: 'series',
      id: 'top',
      name: 'Top Series',
      extra: [
        { name: 'skip' },
        { name: 'genre' }
      ]
    }
  ],
  idPrefixes: ['tt'],
  behaviorHints: {
    configurable: true,
    configurationRequired: false
  }
};