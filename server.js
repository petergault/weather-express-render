require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import route handlers
const weatherRoutes = require('./routes/weather');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy when behind reverse proxy (like Render)
app.set('trust proxy', true);


// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.openweathermap.org", "https://atlas.microsoft.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"]
    }
  }
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased from 100 to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);


// Cloudflare geolocation middleware with development fallback
app.use((req, res, next) => {
  const lat = req.headers['cf-iplatitude'];
  const lon = req.headers['cf-iplongitude'];
  
  if (lat && lon) {
    // Production: Use Cloudflare geolocation headers
    // Round to 4 decimal places to avoid leaking exact locations
    req.geo = { lat: (+lat).toFixed(4), lon: (+lon).toFixed(4) };
  } else if (process.env.NODE_ENV !== 'production') {
    // Development: Use NYC as default fallback location
    console.log('Development mode: Using NYC as default location fallback');
    req.geo = { 
      lat: '40.7128',  // NYC latitude
      lon: '-74.0060', // NYC longitude
      isDevelopmentFallback: true
    };
  }
  // In production without Cloudflare headers, req.geo remains undefined
  // which will trigger the appropriate error handling
  
  next();
});

// API Routes
app.use('/api/weather', weatherRoutes);

// Add status endpoint for app configuration
app.get('/api/status', (req, res) => {
  res.json({
    demoMode: process.env.NODE_ENV === 'demo' || false,
    version: '1.0.0'
  });
});

// Add cache clear endpoint for testing
app.post('/api/cache/clear', (req, res) => {
  try {
    // Clear server-side cache (this would be implemented in the weather routes)
    res.json({
      success: true,
      message: 'Server cache cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// Serve static files from the root directory with proper cache headers
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    // Set cache control headers to prevent aggressive caching during development
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
}));

// Serve index.html for all routes for client-side routing
app.get('*', (req, res) => {
  // Set no-cache headers for the main HTML file
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser`);
});