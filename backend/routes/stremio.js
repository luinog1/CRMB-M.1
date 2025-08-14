const express = require('express');
const router = express.Router();

// Placeholder for Stremio API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Stremio API route base' });
});

// Example route for streaming sources
router.get('/sources/:type/:id', (req, res) => {
  // This will be implemented in a future story
  res.status(501).json({ message: 'Streaming sources endpoint not implemented yet' });
});

module.exports = router;