const express = require('express');
const router = express.Router();
const axios = require('axios');

// Trakt API configuration
const TRAKT_API_URL = 'https://api.trakt.tv';
const TRAKT_REDIRECT_URI = process.env.TRAKT_REDIRECT_URI || 'http://localhost:5173/settings';

// Middleware to check for Trakt authentication
const requireTraktAuth = (req, res, next) => {
  const traktClientId = req.headers['x-trakt-client-id'];
  const traktAuth = req.headers['x-trakt-auth'];
  
  if (!traktClientId || !traktAuth) {
    return res.status(401).json({ message: 'Trakt authentication required' });
  }
  
  req.traktClientId = traktClientId;
  req.traktAuth = traktAuth;
  next();
};

// Trakt API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Trakt API route base' });
});

// Initiate Trakt authentication
router.get('/auth', (req, res) => {
  const clientId = req.headers['x-trakt-client-id'];
  
  if (!clientId) {
    return res.status(400).json({ message: 'Trakt Client ID is required' });
  }
  
  const authUrl = `${TRAKT_API_URL}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${TRAKT_REDIRECT_URI}`;
  
  res.status(200).json({ authUrl });
});

// Handle Trakt authentication callback
router.post('/callback', async (req, res) => {
  const { code } = req.body;
  const clientId = req.headers['x-trakt-client-id'];
  const clientSecret = process.env.TRAKT_CLIENT_SECRET;
  
  if (!code || !clientId) {
    return res.status(400).json({ message: 'Authorization code and Client ID are required' });
  }
  
  try {
    const response = await axios.post(`${TRAKT_API_URL}/oauth/token`, {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: TRAKT_REDIRECT_URI,
      grant_type: 'authorization_code'
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Trakt token exchange error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to exchange authorization code for token' });
  }
});

// Get user watchlist
router.get('/watchlist', requireTraktAuth, async (req, res) => {
  try {
    const response = await axios.get(`${TRAKT_API_URL}/sync/watchlist`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': req.traktClientId,
        'Authorization': `Bearer ${req.traktAuth}`
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Trakt watchlist error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch watchlist' });
  }
});

// Add to watchlist
router.post('/watchlist', requireTraktAuth, async (req, res) => {
  try {
    const response = await axios.post(`${TRAKT_API_URL}/sync/watchlist`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': req.traktClientId,
        'Authorization': `Bearer ${req.traktAuth}`
      }
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Trakt add to watchlist error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to add to watchlist' });
  }
});

module.exports = router;