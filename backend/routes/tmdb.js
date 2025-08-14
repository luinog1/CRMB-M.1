const express = require('express');
const router = express.Router();

// Placeholder for TMDB API routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'TMDB API route base' });
});

// Example route for trending content
router.get('/trending', (req, res) => {
  // This will be implemented in the next story
  res.status(501).json({ message: 'Trending endpoint not implemented yet' });
});

// Example route for new releases
router.get('/new-releases', (req, res) => {
  // This will be implemented in the next story
  res.status(501).json({ message: 'New releases endpoint not implemented yet' });
});

module.exports = router;