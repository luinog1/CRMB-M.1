require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-TMDB-API-Key', 'X-Trakt-Client-ID', 'X-Trakt-Auth', 'X-MDbList-API-Key']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CRUMBLE BFF server is running' });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    message: 'Debug endpoint',
    routes: 'Routes debugging disabled'
  });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`CRUMBLE BFF server running on http://localhost:${PORT}`);
});