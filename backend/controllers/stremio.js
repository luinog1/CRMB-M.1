const addonClient = require('../services/addonClient');

const getCatalog = async (req, res) => {
  const { type, id } = req.params;
  console.log(`🔍 getCatalog: type=${type}, id=${id}`);
  
  try {
    const catalog = await addonClient.getCatalog({ type, id, ...req.query });
    res.json(catalog);
  } catch (error) {
    console.error('❌ Error getting catalog:', error);
    res.status(500).json({ error: 'Error getting catalog', details: error.message });
  }
};

const getMeta = async (req, res) => {
  const { type, id } = req.params;
  console.log(`🔍 getMeta: type=${type}, id=${id}`);
  
  try {
    const meta = await addonClient.getMeta({ type, id });
    res.json(meta);
  } catch (error) {
    console.error('❌ Error getting metadata:', error);
    res.status(500).json({ error: 'Error getting metadata', details: error.message });
  }
};

const getStream = async (req, res) => {
  const { type, id } = req.params;
  console.log(`🔍 getStream: type=${type}, id=${id}`);
  
  try {
    const streams = await addonClient.getStreams({ type, id });
    res.json(streams);
  } catch (error) {
    console.error('❌ Error getting streams:', error);
    res.status(500).json({ error: 'Error getting streams', details: error.message });
  }
};

const getAddons = async (req, res) => {
  console.log('🔍 Getting list of installed addons');
  
  try {
    const addons = addonClient.getAddons();
    console.log(`📊 Found ${addons.length} installed addons`);
    res.json({ addons });
  } catch (error) {
    console.error('❌ Error getting addons:', error);
    res.status(500).json({ error: 'Error getting addons', details: error.message });
  }
};

const installAddon = async (req, res) => {
  const { addonUrl } = req.body;
  console.log(`🔌 Installing addon from URL: ${addonUrl}`);
  
  try {
    const addon = await addonClient.addAddon(addonUrl);
    if (addon) {
      console.log(`✅ Successfully installed addon: ${addon.name} (${addon.id})`);
      res.json({ success: true, addon });
    } else {
      console.error('❌ Failed to install addon');
      res.status(400).json({ error: 'Failed to install addon' });
    }
  } catch (error) {
    console.error('❌ Error installing addon:', error);
    res.status(500).json({ error: 'Error installing addon', details: error.message });
  }
};

module.exports = {
  getCatalog,
  getMeta,
  getStream,
  getAddons,
  installAddon,
  getAvailableAddons: async (req, res) => {
    console.log('🔍 Getting list of available addons');
    
    try {
      const addons = addonClient.getAvailableAddons();
      console.log(`📊 Found ${addons.length} available addons`);
      res.json({ addons });
    } catch (error) {
      console.error('❌ Error getting available addons:', error);
      res.status(500).json({ error: 'Error getting available addons', details: error.message });
    }
  },
};