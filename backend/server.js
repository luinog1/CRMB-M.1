require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const stremioRoutes = require('./routes/stremio');
const testRoutes = require('./routes/test');

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

// Direct test endpoints that bypass all middleware
app.get('/direct-test', (req, res) => {
  console.log('DIRECT TEST ENDPOINT HIT');
  res.status(200).send('direct test response');
});

// API Routes
app.get('/api/stremio/ping', (req, res) => {
  console.log('PING ENDPOINT HIT');
  res.status(200).send('pong');
});

// Mount test routes directly
app.use('/test', testRoutes);

// API Routes
app.use('/api', apiRoutes);

// Stremio API Routes
app.use('/api/stremio', stremioRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const addonClient = require('./services/addonClient');

// Initialize Stremio addon client and start server
(async () => {
  try {
    console.log('🔄 Initializing Stremio addon client...');
    const initSuccess = await addonClient.initialize();
    
    if (initSuccess) {
      console.log('✅ Stremio addon client initialized successfully');
    } else {
      console.error('❌ Stremio addon client initialization failed');
    }
  } catch (error) {
    console.error('❌ Error initializing Stremio addon client:', error);
  }

  // Start server
  app.listen(PORT, () => {
    console.log(`CRUMBLE BFF server running on http://localhost:${PORT}`);
  });
})();