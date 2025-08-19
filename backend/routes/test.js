/**
 * Test Routes
 * This file defines simple test routes for debugging.
 */

const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/simple', (req, res) => {
  console.log('SIMPLE TEST ENDPOINT HIT');
  return res.status(200).json({ 
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;