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

// Run the tests
runTests().catch(error => {
  console.error('❌ Test failed with error:', error);
});