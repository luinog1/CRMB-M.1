const addonClient = require('../services/addonClient');

/**
 * Generate mock content data for fallback when addons fail
 * @param {string} type - Content type (movie, series)
 * @param {string} category - Category (top, trending, etc.)
 * @param {number} count - Number of items to generate
 * @returns {Array} - Array of mock content items
 */
const generateMockContent = (type, category, count = 20) => {
  const mockMovies = [
    { id: 'tt0111161', name: 'The Shawshank Redemption', year: 1994, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0068646', name: 'The Godfather', year: 1972, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0071562', name: 'The Godfather: Part II', year: 1974, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0468569', name: 'The Dark Knight', year: 2008, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0050083', name: '12 Angry Men', year: 1957, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0108052', name: 'Schindler\'s List', year: 1993, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0167260', name: 'The Lord of the Rings: The Return of the King', year: 2003, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0110912', name: 'Pulp Fiction', year: 1994, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0120737', name: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0060196', name: 'The Good, the Bad and the Ugly', year: 1966, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0109830', name: 'Forrest Gump', year: 1994, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0137523', name: 'Fight Club', year: 1999, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt1375666', name: 'Inception', year: 2010, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0080684', name: 'Star Wars: Episode V - The Empire Strikes Back', year: 1980, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0167261', name: 'The Lord of the Rings: The Two Towers', year: 2002, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0073486', name: 'One Flew Over the Cuckoo\'s Nest', year: 1975, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0099685', name: 'Goodfellas', year: 1990, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0076759', name: 'Star Wars', year: 1977, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' },
    { id: 'tt0317248', name: 'City of God', year: 2002, poster: 'https://images.unsplash.com/photo-1489599217719-cb37d61610b2?w=300' },
    { id: 'tt0114369', name: 'Se7en', year: 1995, poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300' }
  ];

  const mockSeries = [
    { id: 'tt0944947', name: 'Game of Thrones', year: 2011, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt0903747', name: 'Breaking Bad', year: 2008, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt0795176', name: 'Planet Earth', year: 2006, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt0185906', name: 'Band of Brothers', year: 2001, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt7366338', name: 'Chernobyl', year: 2019, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt0306414', name: 'The Wire', year: 2002, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt0141842', name: 'The Sopranos', year: 1999, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt1475582', name: 'Sherlock', year: 2010, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt2356777', name: 'True Detective', year: 2014, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' },
    { id: 'tt2560140', name: 'Attack on Titan', year: 2013, poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=300' }
  ];

  const mockData = type === 'series' ? mockSeries : mockMovies;
  const items = mockData.slice(0, count);

  return items.map(item => ({
    id: item.id,
    type: type,
    name: item.name,
    releaseInfo: item.year.toString(),
    poster: item.poster,
    background: item.poster,
    logo: null,
    description: `This is a ${type === 'series' ? 'TV series' : 'movie'} from ${item.year}. ${category === 'top' ? 'Highly rated and popular.' : 'Trending content.'}`,
    runtime: type === 'series' ? null : '120 min',
    genres: ['Drama', 'Action', 'Adventure', 'Thriller', 'Crime'],
    imdbRating: (Math.random() * 3 + 7).toFixed(1),
    trailer: null
  }));
};

/**
 * Get discover content from addons
 * Unified endpoint that can get catalogs by type, genre, and page
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getDiscoverContent = async (req, res) => {
  const { type, category } = req.params;
  const extra = req.query;

  console.log(`🔍 getDiscoverContent: type=${type}, category=${category}`);

  try {
    // Build the request for the addon client
    const args = {
      type: type || 'movie',
      id: category || 'top',
      extra: {
        ...extra
      }
    };

    // Get catalog data from addons
    const catalog = await addonClient.getCatalog(args);

    // Check if we got valid data from addons
    const addonData = catalog.metas || [];

    // If no data from addons, use mock data as fallback
    let contentData = addonData;
    let dataSource = 'addons';

    if (addonData.length === 0) {
      console.warn('⚠️ No data from addons, using mock data fallback');
      contentData = generateMockContent(args.type, args.id);
      dataSource = 'mock_fallback';
    }

    // Standardized response format with metadata
    const response = {
      success: true,
      data: contentData,
      metadata: {
        type: args.type,
        category: args.id,
        timestamp: new Date().toISOString(),
        source: dataSource,
        itemCount: contentData.length,
        addonCount: addonClient.getAddons().length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error getting discover content from addons:', error);

    // Use mock data as fallback when addon calls fail
    console.warn('⚠️ Addon error, using mock data fallback');
    const mockData = generateMockContent(type || 'movie', category || 'top');

    res.status(200).json({
      success: true,
      data: mockData,
      metadata: {
        type: type || 'movie',
        category: category || 'top',
        timestamp: new Date().toISOString(),
        source: 'mock_fallback_error',
        itemCount: mockData.length,
        addonCount: addonClient.getAddons().length,
        error: error.message
      }
    });
  }
};

/**
 * Get specific addon content
 * Unified endpoint for getting content from a specific addon
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getAddonContent = async (req, res) => {
  const { addonId, type, id } = req.params;
  const extra = req.query;
  
  console.log(`🔍 getAddonContent: addonId=${addonId}, type=${type}, id=${id}`);
  
  try {
    // Find the specific addon
    const addon = addonClient.addons.get(addonId);
    if (!addon) {
      return res.status(404).json({ 
        success: false, 
        error: 'Addon not found',
        metadata: {
          addonId,
          type,
          id,
          timestamp: new Date().toISOString(),
          source: 'specific_addon'
        }
      });
    }
    
    // Get content based on type (meta, stream, subtitles)
    let data;
    let contentType;
    
    if (type === 'meta') {
      data = await addon.client.get('meta', extra.type || 'movie', id);
      contentType = 'metadata';
    } else if (type === 'stream') {
      data = await addon.client.get('stream', extra.type || 'movie', id);
      contentType = 'streams';
    } else if (type === 'subtitles') {
      data = await addon.client.get('subtitles', extra.type || 'movie', id, extra);
      contentType = 'subtitles';
    } else {
      // Default to catalog
      data = await addon.client.get('catalog', type, id, extra);
      contentType = 'catalog';
    }
    
    // Standardized response format with metadata
    const response = {
      success: true,
      data: data[contentType] || data,
      metadata: {
        addonId,
        type,
        id,
        timestamp: new Date().toISOString(),
        source: 'specific_addon'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error getting addon content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error getting addon content', 
      details: error.message,
      metadata: {
        addonId,
        type,
        id,
        timestamp: new Date().toISOString(),
        source: 'specific_addon'
      }
    });
  }
};

/**
 * Search across addons
 * Unified search endpoint that queries all addons
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const searchContent = async (req, res) => {
  const { query } = req.params;
  const { type = 'movie' } = req.query;

  console.log(`🔍 searchContent: query=${query}, type=${type}`);

  try {
    // Search across all addons - try catalog search first (more reliable)
    let searchData = [];
    let dataSource = 'addons_search';

    // Get all addons that support catalog operations
    const allAddons = addonClient.getAddons();
    console.log(`📊 Found ${allAddons.length} total addons for search`);

    // Use the addonClient's unified search method
    try {
      console.log('🔍 Using unified addon search...');
      const addonSearchResults = await addonClient.search({ query });
      if (addonSearchResults && addonSearchResults.metas && addonSearchResults.metas.length > 0) {
        searchData.push(...addonSearchResults.metas);
        console.log(`✅ Found ${addonSearchResults.metas.length} results from unified search`);
      } else {
        console.log('⚠️ No results from unified addon search');
      }
    } catch (searchError) {
      console.warn('⚠️ Unified addon search failed:', searchError.message);
    }

    // Remove duplicates based on id
    searchData = Array.from(
      new Map(searchData.map(meta => [meta.id, meta])).values()
    );

    // If no results from addons, provide mock search results
    if (searchData.length === 0) {
      console.warn('⚠️ No search results from addons, using mock data fallback');
      const mockResults = generateMockContent(type === 'series' ? 'tv' : 'movie', 'top', 10).filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      searchData = mockResults;
      dataSource = 'mock_search_fallback';
    }

    // Standardized response format with metadata
    const response = {
      success: true,
      data: searchData,
      metadata: {
        query,
        type,
        timestamp: new Date().toISOString(),
        source: dataSource,
        resultCount: searchData.length,
        addonCount: allAddons.length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error searching content:', error);

    // Fallback to mock search results on error
    console.warn('⚠️ Search error, using mock data fallback');
    const mockResults = generateMockContent('movie', 'top', 5);

    res.status(200).json({
      success: true,
      data: mockResults,
      metadata: {
        query,
        timestamp: new Date().toISOString(),
        source: 'mock_search_fallback_error',
        resultCount: mockResults.length,
        error: error.message
      }
    });
  }
};

/**
 * Get stream content by ID
 * Unified endpoint for getting streams for a specific item
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getStreamContent = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  
  console.log(`🔍 getStreamContent: id=${id}, type=${type}`);
  
  try {
    // Get streams from addons
    const streams = await addonClient.getStreams({ type: type || 'movie', id });
    
    // Standardized response format with metadata
    const response = {
      success: true,
      data: streams.streams || [],
      metadata: {
        id,
        type: type || 'movie',
        timestamp: new Date().toISOString(),
        source: 'addons_streams'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error getting stream content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error getting stream content', 
      details: error.message,
      metadata: {
        id,
        type: type || 'movie',
        timestamp: new Date().toISOString(),
        source: 'addons_streams'
      }
    });
  }
};

/**
 * Get metadata for a specific item
 * Unified endpoint for getting detailed metadata
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMetadataContent = async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  
  console.log(`🔍 getMetadataContent: id=${id}, type=${type}`);
  
  try {
    // Get metadata from addons
    const meta = await addonClient.getMeta({ type: type || 'movie', id });
    
    // Standardized response format with metadata
    const response = {
      success: true,
      data: meta.meta || null,
      metadata: {
        id,
        type: type || 'movie',
        timestamp: new Date().toISOString(),
        source: 'addons_meta'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error getting metadata content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error getting metadata content', 
      details: error.message,
      metadata: {
        id,
        type: type || 'movie',
        timestamp: new Date().toISOString(),
        source: 'addons_meta'
      }
    });
  }
};

module.exports = {
  getDiscoverContent,
  getAddonContent,
  searchContent,
  getStreamContent,
  getMetadataContent
};