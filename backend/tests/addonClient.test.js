/**
 * Stremio Addon Client Test
 * This script tests the functionality of the Stremio addon client.
 */

const addonClient = require('../services/addonClient');

// Test movie and series IDs for testing
const TEST_MOVIE_ID = 'tt0111161'; // The Shawshank Redemption
const TEST_SERIES_ID = 'tt0944947'; // Game of Thrones

async function runTests() {
  console.log('🧪 Starting Stremio Addon Client Tests');
  
  // Initialize the addon client
  console.log('\n🔄 Initializing addon client...');
  await addonClient.initialize();
  
  // Get loaded addons
  console.log('\n📋 Loaded Addons:');
  const addons = addonClient.getAddons();
  
  if (addons.length === 0) {
    console.error('❌ No addons loaded!');
    return;
  }
  
  addons.forEach(addon => {
    console.log(`- ${addon.name} (${addon.id})`);
    console.log(`  Resources: ${addon.resources.join(', ')}`);
    console.log(`  Types: ${addon.types.join(', ')}`);
  });
  
  // Test catalog
  console.log('\n🔍 Testing catalog...');
  try {
    const movieCatalog = await addonClient.getCatalog({
      type: 'movie',
      id: 'top'
    });
    
    console.log(`✅ Movie catalog fetched: ${movieCatalog.metas ? movieCatalog.metas.length : 0} items`);
    
    if (movieCatalog.metas && movieCatalog.metas.length > 0) {
      console.log('📝 First movie:');
      console.log(`  - ID: ${movieCatalog.metas[0].id}`);
      console.log(`  - Name: ${movieCatalog.metas[0].name}`);
    }
  } catch (error) {
    console.error('❌ Error fetching movie catalog:', error);
  }
  
  try {
    const seriesCatalog = await addonClient.getCatalog({
      type: 'series',
      id: 'top'
    });
    
    console.log(`✅ Series catalog fetched: ${seriesCatalog.metas ? seriesCatalog.metas.length : 0} items`);
    
    if (seriesCatalog.metas && seriesCatalog.metas.length > 0) {
      console.log('📝 First series:');
      console.log(`  - ID: ${seriesCatalog.metas[0].id}`);
      console.log(`  - Name: ${seriesCatalog.metas[0].name}`);
    }
  } catch (error) {
    console.error('❌ Error fetching series catalog:', error);
  }
  
  // Test metadata
  console.log('\n🔍 Testing metadata...');
  try {
    const movieMeta = await addonClient.getMeta({
      type: 'movie',
      id: TEST_MOVIE_ID
    });
    
    if (movieMeta && movieMeta.meta) {
      console.log('✅ Movie metadata fetched:');
      console.log(`  - ID: ${movieMeta.meta.id}`);
      console.log(`  - Name: ${movieMeta.meta.name}`);
      console.log(`  - Year: ${movieMeta.meta.releaseInfo}`);
    } else {
      console.log('⚠️ No movie metadata found');
    }
  } catch (error) {
    console.error('❌ Error fetching movie metadata:', error);
  }
  
  try {
    const seriesMeta = await addonClient.getMeta({
      type: 'series',
      id: TEST_SERIES_ID
    });
    
    if (seriesMeta && seriesMeta.meta) {
      console.log('✅ Series metadata fetched:');
      console.log(`  - ID: ${seriesMeta.meta.id}`);
      console.log(`  - Name: ${seriesMeta.meta.name}`);
      console.log(`  - Year: ${seriesMeta.meta.releaseInfo}`);
    } else {
      console.log('⚠️ No series metadata found');
    }
  } catch (error) {
    console.error('❌ Error fetching series metadata:', error);
  }
  
  // Test streams
  console.log('\n🔍 Testing streams...');
  try {
    const movieStreams = await addonClient.getStreams({
      type: 'movie',
      id: TEST_MOVIE_ID
    });
    
    console.log(`✅ Movie streams fetched: ${movieStreams.streams ? movieStreams.streams.length : 0} streams`);
    
    if (movieStreams.streams && movieStreams.streams.length > 0) {
      console.log('📝 First stream:');
      console.log(`  - Name: ${movieStreams.streams[0].name}`);
      console.log(`  - Title: ${movieStreams.streams[0].title}`);
    }
  } catch (error) {
    console.error('❌ Error fetching movie streams:', error);
  }

  // Test search
  console.log('\n🔍 Testing search...');
  try {
    const searchResults = await addonClient.search({
      query: 'Game of Thrones'
    });

    console.log(`✅ Search results fetched: ${searchResults.metas ? searchResults.metas.length : 0} items`);

    if (searchResults.metas && searchResults.metas.length > 0) {
      console.log('📝 First search result:');
      console.log(`  - ID: ${searchResults.metas[0].id}`);
      console.log(`  - Name: ${searchResults.metas[0].name}`);
      console.log(`  - Type: ${searchResults.metas[0].type}`);
    } else {
      console.log('⚠️ No search results found');
    }
  } catch (error) {
    console.error('❌ Error testing search:', error);
  }

  // Test addon management
  console.log('\n🔍 Testing addon management...');
  
  // Test adding a new addon
  try {
    console.log('Adding a new addon...');
    const newAddon = await addonClient.addAddon('https://v3-community.strem.io/manifest.json');
    
    if (newAddon) {
      console.log(`✅ Added new addon: ${newAddon.name} (${newAddon.id})`);
    } else {
      console.log('⚠️ Failed to add new addon');
    }
  } catch (error) {
    console.error('❌ Error adding new addon:', error);
  }
  
  // Get updated list of addons
  console.log('\n📋 Updated Addons List:');
  const updatedAddons = addonClient.getAddons();
  updatedAddons.forEach(addon => {
    console.log(`- ${addon.name} (${addon.id})`);
  });
  
  console.log('\n🏁 Stremio Addon Client Tests Completed');
}

// Test the new getAvailableAddons method
async function testGetAvailableAddons() {
  console.log('\n🔍 Testing getAvailableAddons method...');
  
  try {
    const availableAddons = addonClient.getAvailableAddons();
    console.log(`✅ Found ${availableAddons.length} available addons`);
    
    if (availableAddons.length > 0) {
      console.log('📝 First available addon:');
      console.log(`  - ID: ${availableAddons[0].id}`);
      console.log(`  - Name: ${availableAddons[0].name}`);
      console.log(`  - URL: ${availableAddons[0].url}`);
      console.log(`  - Enabled: ${availableAddons[0].enabled}`);
    } else {
      console.log('⚠️ No available addons found');
    }
    
    return availableAddons;
  } catch (error) {
    console.error('❌ Error testing getAvailableAddons method:', error);
    return [];
  }
}

// Test the new API endpoint
async function testGetAvailableAddonsEndpoint() {
  console.log('\n🔍 Testing /api/stremio/addons/available endpoint...');
  
  try {
    const response = await fetch('http://localhost:3001/api/stremio/addons/available');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API endpoint responded with ${data.addons?.length || 0} addons`);
    
    if (data.addons && data.addons.length > 0) {
      console.log('📝 First addon from API:');
      console.log(`  - ID: ${data.addons[0].id}`);
      console.log(`  - Name: ${data.addons[0].name}`);
      console.log(`  - Enabled: ${data.addons[0].enabled}`);
    }
    
    return data.addons || [];
  } catch (error) {
    console.error('❌ Error testing API endpoint:', error);
    return [];
  }
}

// Run the new tests
async function runNewTests() {
  console.log('\n🧪 Starting New Addon Functionality Tests');
  
  // Test the getAvailableAddons method
  await testGetAvailableAddons();
  
  // Test the API endpoint
  await testGetAvailableAddonsEndpoint();
  
  console.log('\n🏁 New Addon Functionality Tests Completed');
}

// Run all tests
async function runAllTests() {
  await runTests();
  await runNewTests();
}

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Test failed with error:', error);
});

// Run the tests
runTests().catch(error => {
  console.error('❌ Test failed with error:', error);
});