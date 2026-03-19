// Simple CORS proxy server for development
// Run with: node proxy-server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.text());

// Import fetch for Node.js
let fetch;
(async () => {
  const { default: nodeFetch } = await import('node-fetch');
  fetch = nodeFetch;
})();

// Wait for fetch to be available
const waitForFetch = () => {
  return new Promise((resolve) => {
    const check = () => {
      if (fetch) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

// SMS API proxy endpoint
app.post('/api/sms', async (req, res) => {
  await waitForFetch();
  try {
    const { apiKey, message, numbers } = req.body;
    
    console.log('📱 SMS Proxy Request:', { numbers, messageLength: message.length });
    
    // Create form data for Fast2SMS
    const formData = new URLSearchParams();
    formData.append('message', message);
    formData.append('language', 'english');
    formData.append('route', 'q');
    formData.append('numbers', numbers);
    
    // Make request to Fast2SMS
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const result = await response.json();
    
    console.log('📊 Fast2SMS Response:', result);
    
    if (result.return === true || result.status_code === 200) {
      res.json({
        success: true,
        data: result,
        message: 'SMS sent successfully'
      });
    } else {
      res.json({
        success: false,
        error: result.message || 'SMS sending failed',
        data: result
      });
    }
    
  } catch (error) {
    console.error('❌ SMS Proxy Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Direct Overpass API proxy with proper POST handling
app.post('/api/overpass', async (req, res) => {
  await waitForFetch();
  try {
    let query = req.body;
    
    // Ensure JSON output format
    if (!query.includes('[out:json]')) {
      query = query.replace(/^\[out:[^\]]*\]/, '[out:json]');
      if (!query.startsWith('[out:json]')) {
        query = '[out:json]' + query;
      }
    }
    
    console.log('Overpass query:', query.substring(0, 100) + '...');
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Roamsafe/1.0'
      }
    });
    
    const data = await response.text();
    
    // Check if response is JSON
    if (data.startsWith('{') || data.startsWith('[')) {
      res.json(JSON.parse(data));
    } else {
      console.error('Overpass returned non-JSON:', data.substring(0, 200));
      res.status(500).json({ error: 'Overpass API returned invalid response' });
    }
  } catch (error) {
    console.error('Overpass proxy error:', error.message);
    res.status(500).json({ error: 'Overpass API unavailable: ' + error.message });
  }
});

// GET version for Overpass API
app.get('/api/overpass', async (req, res) => {
  await waitForFetch();
  try {
    let query = decodeURIComponent(req.query.data || '');
    
    // Ensure JSON output format
    if (!query.includes('[out:json]')) {
      query = query.replace(/^\[out:[^\]]*\]/, '[out:json]');
      if (!query.startsWith('[out:json]')) {
        query = '[out:json]' + query;
      }
    }
    
    console.log('Overpass GET query:', query.substring(0, 100) + '...');
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Roamsafe/1.0'
      }
    });
    
    const data = await response.text();
    
    // Check if response is JSON
    if (data.startsWith('{') || data.startsWith('[')) {
      res.json(JSON.parse(data));
    } else {
      console.error('Overpass returned non-JSON:', data.substring(0, 200));
      res.status(500).json({ error: 'Overpass API returned invalid response' });
    }
  } catch (error) {
    console.error('Overpass proxy error:', error.message);
    res.status(500).json({ error: 'Overpass API unavailable: ' + error.message });
  }
});

// Nominatim API proxy
app.get('/api/nominatim/reverse', async (req, res) => {
  await waitForFetch();
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://nominatim.openstreetmap.org/reverse?${queryString}`;
    
    console.log('Nominatim URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Roamsafe/1.0'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Nominatim proxy error:', error.message);
    res.status(500).json({ error: 'Nominatim API unavailable: ' + error.message });
  }
});

// World Bank API proxy
app.get('/api/worldbank/v2/country/:country/indicator/:indicator', async (req, res) => {
  await waitForFetch();
  try {
    const { country, indicator } = req.params;
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?${queryString}`;
    
    console.log('World Bank URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('World Bank proxy error:', error.message);
    res.status(500).json({ error: 'World Bank API unavailable: ' + error.message });
  }
});

// Travel Advisories proxy
app.get('/api/travel/content/travel/en/traveladvisories/traveladvisories.json', async (req, res) => {
  await waitForFetch();
  try {
    const url = 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.json';
    
    console.log('Travel API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Travel API proxy error:', error.message);
    res.status(500).json({ error: 'Travel API unavailable: ' + error.message });
  }
});

// Emergency Numbers proxy
app.get('/api/emergency/datasets/emergency-numbers/master/data/emergency-numbers.json', async (req, res) => {
  await waitForFetch();
  try {
    const url = 'https://raw.githubusercontent.com/datasets/emergency-numbers/master/data/emergency-numbers.json';
    
    console.log('Emergency API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Emergency API proxy error:', error.message);
    res.status(500).json({ error: 'Emergency API unavailable: ' + error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Roamsafe proxy server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Roamsafe Proxy Server running on http://localhost:${PORT}`);
  console.log('📡 Real API data now available for development');
  console.log('🔗 Available endpoints:');
  console.log('   - POST /api/sms (Fast2SMS API)');
  console.log('   - POST /api/overpass (Overpass API)');
  console.log('   - GET /api/nominatim/reverse (Nominatim Geocoding)');
  console.log('   - GET /api/worldbank/v2/... (World Bank Data)');
  console.log('   - GET /api/travel/... (Travel Advisories)');
  console.log('   - GET /api/emergency/... (Emergency Numbers)');
});