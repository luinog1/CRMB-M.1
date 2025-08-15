const express = require('express');
const router = express.Router();
const axios = require('axios');

// MDbList API configuration
const MDBLIST_API_URL = 'https://mdblist.com/api';

// Middleware to check for MDbList API key
const requireMdblistApiKey = (req, res, next) => {
  const apiKey = req.headers['x-mdblist-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ message: 'MDbList API key required' });
  }
  
  req.mdblistApiKey = apiKey;
  next();
};

// MDbList API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'MDbList API route base' });
});

// Get item details
router.get('/info/:id', requireMdblistApiKey, async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.get(`${MDBLIST_API_URL}?apikey=${req.mdblistApiKey}&i=${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('MDbList info error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch item details' });
  }
});

// Search for items
router.get('/search', requireMdblistApiKey, async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  
  try {
    const response = await axios.get(`${MDBLIST_API_URL}?apikey=${req.mdblistApiKey}&s=${encodeURIComponent(query)}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('MDbList search error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to search items' });
  }
});

// Get user lists
router.get('/lists', requireMdblistApiKey, async (req, res) => {
  try {
    const response = await axios.get(`${MDBLIST_API_URL}/lists?apikey=${req.mdblistApiKey}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('MDbList lists error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch user lists' });
  }
});

// Get list items
router.get('/list/:id', requireMdblistApiKey, async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.get(`${MDBLIST_API_URL}/lists/items?apikey=${req.mdblistApiKey}&list=${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('MDbList list items error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch list items' });
  }
});

// Add item to list
router.post('/list/:id/add', requireMdblistApiKey, async (req, res) => {
  const { id } = req.params;
  const { itemId } = req.body;
  
  if (!itemId) {
    return res.status(400).json({ message: 'Item ID is required' });
  }
  
  try {
    const response = await axios.get(`${MDBLIST_API_URL}/lists/add?apikey=${req.mdblistApiKey}&list=${id}&i=${itemId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('MDbList add item error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to add item to list' });
  }
});

// Remove item from list
router.delete('/list/:id/remove/:itemId', requireMdblistApiKey, async (req, res) => {
  const { id, itemId } = req.params;
  
  try {
    const response = await axios.get(`${MDBLIST_API_URL}/lists/remove?apikey=${req.mdblistApiKey}&list=${id}&i=${itemId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('MDbList remove item error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to remove item from list' });
  }
});

module.exports = router;