const express = require('express');
const router = express.Router();

// Placeholder for Trakt API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Trakt API route base' });
});

// Example route for user watchlist
router.get('/watchlist', (req, res) => {
  // This will be implemented in a future story
  res.status(501).json({ message: 'Watchlist endpoint not implemented yet' });
});

module.exports = router;