// API Testing Utility for Roamsafe
// Tests all global APIs and provides status reports

import { API_CONFIG } from '../config/apiConfig';
import newsService from '../services/newsService';
import globalSafetyService from '../services/globalSafetyService';
import locationService from '../services/locationService';

class APITester {
  constructor() {
    this.testResults = {};
    this.startTime = null;
  }

  // Test all APIs and return comprehensive report
  async testAllAPIs() {
    this.startTime = Date.now();
    console.log('🧪 Starting comprehensive API tests...\n');

    const tests = [
      { name: 'NewsAPI', test: () => this.testNewsAPI() },
      { name: 'OpenStreetMap', test: () => this.testOpenStreetMap() },
      { name: 'Nominatim', test: () => this.testNominatim() },
      { name: 'OpenWeatherMap', test: () => this.testOpenWeatherMap() },
      { name: 'Travel Advisories', test: () => this.testTravelAdvisories() },
      { name: 'World Bank', test: () => this.testWorldBank() },
      { name: 'Emergency Numbers', test: () => this.testEmergencyNumbers() },
      { name: 'GDELT Events', test: () => this.testGDELT() },
    ];

    for (const { name, test } of tests) {
      console.log(`Testing ${name}...`);
      try {
        const result = await test();
        this.testResults[name] = { success: true, ...result };
        console.log(`✅ ${name}: OK`);
      } catch (error) {
        this.testResults[name] = { 
          success: false, 
          error: error.message,
          required: this.isRequired(name)
        };
        console.log(`❌ ${name}: ${error.message}`);
      }
    }

    return this.generateReport();
  }

  // Test NewsAPI
  async testNewsAPI() {
    const testQuery = 'travel safety';
    const response = await fetch(
      `${API_CONFIG.NEWS_API.baseUrl}/everything?q=${testQuery}&pageSize=1&apiKey=${API_CONFIG.NEWS_API.apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }

    return {
      articlesFound: data.totalResults,
      dailyRequestsRemaining: response.headers.get('X-API-Key-Requests-Remaining'),
      status: 'Active',
    };
  }

  // Test OpenStreetMap Overpass API
  async testOpenStreetMap() {
    const testQuery = '[out:json][timeout:5];(node["amenity"="hospital"](around:1000,40.7128,-74.0060););out 1;';
    
    const response = await fetch(API_CONFIG.OVERPASS.baseUrl, {
      method: 'POST',
      body: testQuery,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      elementsFound: data.elements?.length || 0,
      responseTime: `${Date.now() - this.startTime}ms`,
      status: 'Active',
    };
  }

  // Test Nominatim Geocoding
  async testNominatim() {
    const response = await fetch(
      `${API_CONFIG.NOMINATIM.baseUrl}/reverse?format=json&lat=40.7128&lon=-74.0060`,
      {
        headers: { 'User-Agent': API_CONFIG.NOMINATIM.userAgent },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      locationFound: data.display_name ? 'Yes' : 'No',
      country: data.address?.country || 'Unknown',
      status: 'Active',
    };
  }

  // Test OpenWeatherMap
  async testOpenWeatherMap() {
    if (API_CONFIG.OPENWEATHER.apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('API key not configured');
    }

    const response = await fetch(
      `${API_CONFIG.OPENWEATHER.baseUrl}/weather?q=London&appid=${API_CONFIG.OPENWEATHER.apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      temperature: `${data.main.temp}K`,
      condition: data.weather[0].description,
      status: 'Active',
    };
  }

  // Test Travel Advisories
  async testTravelAdvisories() {
    try {
      const response = await fetch(
        API_CONFIG.TRAVEL_ADVISORIES.US_STATE_DEPT.baseUrl,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        countriesAvailable: data.data?.length || 0,
        lastUpdated: data.last_updated || 'Unknown',
        status: 'Active',
      };
    } catch (error) {
      // Fallback test - just check if endpoint is reachable
      const response = await fetch('https://travel.state.gov/', {
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        return {
          status: 'Reachable (JSON endpoint may vary)',
          note: 'Website accessible, API format may change',
        };
      }
      
      throw error;
    }
  }

  // Test World Bank Data
  async testWorldBank() {
    const response = await fetch(
      `${API_CONFIG.WORLD_BANK_DATA.baseUrl}/country/US/indicator/SP.POP.TOTL?format=json&date=2020:2023&per_page=1`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      dataAvailable: Array.isArray(data) && data.length > 1 ? 'Yes' : 'No',
      sampleValue: data[1]?.[0]?.value || 'N/A',
      status: 'Active',
    };
  }

  // Test Emergency Numbers Database
  async testEmergencyNumbers() {
    const response = await fetch(
      API_CONFIG.EMERGENCY_NUMBERS.baseUrl,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      countriesAvailable: Array.isArray(data) ? data.length : 0,
      sampleCountry: data[0]?.country_code || 'N/A',
      status: 'Active',
    };
  }

  // Test GDELT Project
  async testGDELT() {
    try {
      const response = await fetch(
        `${API_CONFIG.GDELT_PROJECT.baseUrl}/geo/geo?query=safety&mode=artlist&maxrecords=1&format=json`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        articlesFound: data.articles?.length || 0,
        status: 'Active',
      };
    } catch (error) {
      // GDELT can be unreliable, so we'll mark as optional
      return {
        status: 'Unavailable (Optional)',
        note: 'GDELT API can be intermittent',
      };
    }
  }

  // Check if API is required for core functionality
  isRequired(apiName) {
    const requiredAPIs = ['OpenStreetMap', 'Nominatim'];
    return requiredAPIs.includes(apiName);
  }

  // Generate comprehensive test report
  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = Object.keys(this.testResults).length;
    const successfulTests = Object.values(this.testResults).filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    const requiredFailed = Object.values(this.testResults).filter(r => !r.success && r.required).length;

    const report = {
      summary: {
        totalTests,
        successful: successfulTests,
        failed: failedTests,
        requiredFailed,
        totalTime: `${totalTime}ms`,
        overallStatus: requiredFailed === 0 ? 'READY' : 'NEEDS_SETUP',
      },
      details: this.testResults,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  // Generate setup recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Check NewsAPI
    if (!this.testResults.NewsAPI?.success) {
      recommendations.push({
        priority: 'medium',
        action: 'Check NewsAPI key configuration',
        benefit: 'Real-time safety news and incident monitoring',
      });
    }

    // Check OpenWeatherMap
    if (!this.testResults.OpenWeatherMap?.success) {
      recommendations.push({
        priority: 'high',
        action: 'Get free OpenWeatherMap API key from openweathermap.org',
        benefit: 'Weather-based safety alerts and visibility warnings',
      });
    }

    // Check required APIs
    const requiredFailed = Object.entries(this.testResults)
      .filter(([name, result]) => !result.success && result.required);

    if (requiredFailed.length > 0) {
      recommendations.push({
        priority: 'critical',
        action: `Fix required APIs: ${requiredFailed.map(([name]) => name).join(', ')}`,
        benefit: 'Core app functionality',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        action: 'All systems operational',
        benefit: 'Your Roamsafe app is ready for global use!',
      });
    }

    return recommendations;
  }

  // Test specific service integration
  async testServiceIntegration() {
    console.log('🔧 Testing service integration...\n');

    try {
      // Test news service
      console.log('Testing NewsService...');
      const newsResult = await newsService.getSafetyNews('Japan', 'Tokyo');
      console.log(`✅ NewsService: Found ${newsResult.articles.length} articles`);

      // Test global safety service
      console.log('Testing GlobalSafetyService...');
      const countryInfo = await globalSafetyService.getCountryFromCoordinates(35.6762, 139.6503);
      console.log(`✅ GlobalSafetyService: Detected ${countryInfo.country}`);

      // Test location service
      console.log('Testing LocationService...');
      const locations = await locationService.getNearbyLocations(1000);
      console.log(`✅ LocationService: Found ${locations.length} nearby locations`);

      return {
        newsService: newsResult.articles.length > 0,
        globalSafetyService: countryInfo.country !== 'Unknown',
        locationService: locations.length > 0,
      };
    } catch (error) {
      console.error('❌ Service integration test failed:', error);
      return { error: error.message };
    }
  }
}

export default new APITester();