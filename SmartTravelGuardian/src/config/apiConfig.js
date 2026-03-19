// Global API Configuration for Roamsafe
// Worldwide coverage for travel safety

// CORS Proxy for browser development (bypasses CORS restrictions)
// Multiple proxies for redundancy
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
];

const CORS_PROXY = CORS_PROXIES[0]; // Primary proxy

// For React Native, we'll use the keys directly since environment variables 
// can be tricky in React Native. In production, use a secure key management system.

export const API_CONFIG = {
  // === GLOBAL MAPPING & LOCATION APIs (FREE) ===
  OVERPASS: {
    baseUrl: 'https://overpass-api.de/api/interpreter',
    proxyUrl: `${CORS_PROXY}https://overpass-api.de/api/interpreter`,
    timeout: 25000,
    rateLimit: '1 request per second',
    coverage: 'Worldwide',
  },
  
  NOMINATIM: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    proxyUrl: `${CORS_PROXY}https://nominatim.openstreetmap.org`,
    timeout: 10000,
    rateLimit: '1 request per second',
    userAgent: 'Roamsafe/1.0',
    coverage: 'Worldwide',
  },

  // === GLOBAL WEATHER API ===
  OPENWEATHER: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: 'f430db9fcdba51ae39fd533b19a6a44e',
    timeout: 10000,
    units: 'metric',
    coverage: 'Worldwide',
  },

  // === GLOBAL SAFETY & CRIME DATA ===
  GLOBAL_INCIDENT_MAP: {
    baseUrl: 'https://www.globalincidentmap.com/api',
    proxyUrl: `${CORS_PROXY}https://www.globalincidentmap.com/api`,
    timeout: 15000,
    coverage: 'Worldwide',
    note: 'Crime and incident data globally',
  },

  TRAVEL_ADVISORIES: {
    // US State Department Travel Advisories
    US_STATE_DEPT: {
      baseUrl: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.json',
      proxyUrl: `${CORS_PROXY}https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.json`,
      timeout: 10000,
      coverage: 'Worldwide',
    },
    // UK Foreign Office Travel Advice
    UK_FCO: {
      baseUrl: 'https://www.gov.uk/api/foreign-travel-advice',
      proxyUrl: `${CORS_PROXY}https://www.gov.uk/api/foreign-travel-advice`,
      timeout: 10000,
      coverage: 'Worldwide',
    },
    // Canadian Travel Advisories
    CANADA_GAC: {
      baseUrl: 'https://travel.gc.ca/travelling/advisories',
      proxyUrl: `${CORS_PROXY}https://travel.gc.ca/travelling/advisories`,
      timeout: 10000,
      coverage: 'Worldwide',
    },
  },

  // === GLOBAL NEWS & EVENTS ===
  NEWS_API: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: 'c076cd28d7d446aebe02d18fef6ce045',
    timeout: 10000,
    coverage: 'Worldwide',
    categories: ['general', 'health', 'technology'],
  },

  GDELT_PROJECT: {
    baseUrl: 'https://api.gdeltproject.org/api/v2',
    proxyUrl: `${CORS_PROXY}https://api.gdeltproject.org/api/v2`,
    timeout: 15000,
    coverage: 'Worldwide',
    note: 'Global events and sentiment analysis',
  },

  // === GLOBAL TRANSPORTATION ===
  GTFS_FEEDS: {
    baseUrl: 'https://transitfeeds.com/api',
    apiKey: '',
    timeout: 10000,
    coverage: 'Worldwide public transport',
  },

  // === GLOBAL EMERGENCY SERVICES ===
  EMERGENCY_NUMBERS: {
    // Static database of emergency numbers by country
    baseUrl: 'https://raw.githubusercontent.com/datasets/emergency-numbers/master/data/emergency-numbers.json',
    proxyUrl: `${CORS_PROXY}https://raw.githubusercontent.com/datasets/emergency-numbers/master/data/emergency-numbers.json`,
    timeout: 5000,
    coverage: 'Worldwide',
  },

  // === GLOBAL GEOCODING & PLACES ===
  MAPBOX: {
    baseUrl: 'https://api.mapbox.com',
    apiKey: '',
    timeout: 10000,
    coverage: 'Worldwide',
  },

  GOOGLE_PLACES: {
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    apiKey: '',
    timeout: 10000,
    coverage: 'Worldwide',
  },

  // === GLOBAL CRIME & SAFETY DATABASES ===
  NUMBEO_CRIME: {
    baseUrl: 'https://www.numbeo.com/api',
    apiKey: '',
    timeout: 10000,
    coverage: 'Worldwide crime statistics',
  },

  WORLD_BANK_DATA: {
    baseUrl: 'https://api.worldbank.org/v2',
    proxyUrl: `${CORS_PROXY}https://api.worldbank.org/v2`,
    timeout: 10000,
    coverage: 'Worldwide country statistics',
    format: 'json',
  },

  // === GLOBAL AI & INTELLIGENCE ===
  OPENAI: {
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    timeout: 30000,
    coverage: 'Worldwide knowledge',
  },

  // === GLOBAL HEALTH & DISEASE TRACKING ===
  WHO_DISEASE_OUTBREAK: {
    baseUrl: 'https://disease.sh/v3/covid-19',
    proxyUrl: `${CORS_PROXY}https://disease.sh/v3/covid-19`,
    timeout: 10000,
    coverage: 'Worldwide health data',
  },

  CDC_TRAVEL_HEALTH: {
    baseUrl: 'https://wwwnc.cdc.gov/travel/api',
    proxyUrl: `${CORS_PROXY}https://wwwnc.cdc.gov/travel/api`,
    timeout: 10000,
    coverage: 'Worldwide health advisories',
  },
};

// Helper function to get the appropriate URL (local proxy for browser, direct for mobile)
export const getApiUrl = (configKey, endpoint = '') => {
  const config = API_CONFIG[configKey];
  if (!config) return '';
  
  // Use local proxy server for browser development to get REAL data
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  if (isLocalhost) {
    // Map to local proxy endpoints for REAL API data
    const proxyMap = {
      'OVERPASS': 'http://localhost:3001/api/overpass',
      'NOMINATIM': 'http://localhost:3001/api/nominatim',
      'WORLD_BANK_DATA': 'http://localhost:3001/api/worldbank',
      'TRAVEL_ADVISORIES': 'http://localhost:3001/api/travel',
      'EMERGENCY_NUMBERS': 'http://localhost:3001/api/emergency',
    };
    
    const baseUrl = proxyMap[configKey] || config.baseUrl;
    const finalUrl = endpoint ? `${baseUrl}${endpoint}` : baseUrl;
    console.log('🔗 Generated URL for', configKey, ':', finalUrl);
    return finalUrl;
  }
  
  // Direct URLs for production/mobile
  return endpoint ? `${config.baseUrl}${endpoint}` : config.baseUrl;
};

// Helper function to fetch with local proxy (REAL DATA)
export const fetchWithProxy = async (url, options = {}) => {
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  
  console.log('🌐 Fetching:', url, 'isLocalhost:', isLocalhost);
  
  if (!isLocalhost) {
    // Direct fetch for production/mobile
    return fetch(url, options);
  }

  // Use local proxy for REAL API data (no health check needed)
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000), // 15 second timeout for real APIs
  });
};

// API Status checker
export const checkAPIStatus = async () => {
  const status = {
    overpass: false,
    nominatim: false,
    openweather: false,
    barcelona: false,
    madrid: false,
  };

  try {
    // Check Overpass API
    const overpassResponse = await fetch(API_CONFIG.OVERPASS.baseUrl, {
      method: 'POST',
      body: '[out:json][timeout:1];(node(0););out;',
      signal: AbortSignal.timeout(5000),
    });
    status.overpass = overpassResponse.ok;
  } catch (error) {
    console.log('Overpass API unavailable');
  }

  try {
    // Check Nominatim
    const nominatimResponse = await fetch(
      `${API_CONFIG.NOMINATIM.baseUrl}/reverse?format=json&lat=41.3851&lon=2.1734`,
      { signal: AbortSignal.timeout(5000) }
    );
    status.nominatim = nominatimResponse.ok;
  } catch (error) {
    console.log('Nominatim API unavailable');
  }

  try {
    // Check OpenWeather (if key provided)
    if (API_CONFIG.OPENWEATHER.apiKey !== 'YOUR_API_KEY_HERE') {
      const weatherResponse = await fetch(
        `${API_CONFIG.OPENWEATHER.baseUrl}/weather?q=Barcelona&appid=${API_CONFIG.OPENWEATHER.apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      );
      status.openweather = weatherResponse.ok;
    }
  } catch (error) {
    console.log('OpenWeather API unavailable');
  }

  return status;
};

// Rate limiting helper
export const rateLimiter = {
  lastCalls: {},
  
  canMakeRequest(apiName, minInterval = 1000) {
    const now = Date.now();
    const lastCall = this.lastCalls[apiName] || 0;
    
    if (now - lastCall >= minInterval) {
      this.lastCalls[apiName] = now;
      return true;
    }
    
    return false;
  },
  
  async waitForRateLimit(apiName, minInterval = 1000) {
    const now = Date.now();
    const lastCall = this.lastCalls[apiName] || 0;
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCalls[apiName] = Date.now();
  },
};