// Global Safety Data Service
// Worldwide coverage for travel safety intelligence

import { API_CONFIG, getApiUrl, fetchWithProxy } from '../config/apiConfig';

class GlobalSafetyService {
  constructor() {
    this.countryCache = new Map();
    this.safetyCache = new Map();
    this.emergencyNumbers = null;
    this.travelAdvisories = new Map();
  }

  // Get country information from coordinates
  async getCountryFromCoordinates(latitude, longitude) {
    const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    
    if (this.countryCache.has(cacheKey)) {
      return this.countryCache.get(cacheKey);
    }

    try {
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const url = `${getApiUrl('NOMINATIM')}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
      
      const response = await fetchWithProxy(url, {
        headers: {
          'User-Agent': API_CONFIG.NOMINATIM.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const countryInfo = {
        country: data.address?.country || 'Unknown',
        countryCode: data.address?.country_code?.toUpperCase() || 'XX',
        state: data.address?.state || data.address?.province || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        continent: this.getContinent(data.address?.country_code),
        timezone: await this.getTimezone(latitude, longitude),
      };

      this.countryCache.set(cacheKey, countryInfo);
      return countryInfo;
    } catch (error) {
      console.error('❌ Real API Error:', error.message);
      console.error('🚀 Make sure proxy server is running: node proxy-server.js');
      
      // NO TEST DATA - throw error as requested
      throw new Error('Real geocoding API unavailable - ' + error.message);
    }
  }

  // Get continent from country code
  getContinent(countryCode) {
    const continentMap = {
      // Europe
      'AD': 'Europe', 'AL': 'Europe', 'AT': 'Europe', 'BA': 'Europe', 'BE': 'Europe',
      'BG': 'Europe', 'BY': 'Europe', 'CH': 'Europe', 'CZ': 'Europe', 'DE': 'Europe',
      'DK': 'Europe', 'EE': 'Europe', 'ES': 'Europe', 'FI': 'Europe', 'FR': 'Europe',
      'GB': 'Europe', 'GR': 'Europe', 'HR': 'Europe', 'HU': 'Europe', 'IE': 'Europe',
      'IS': 'Europe', 'IT': 'Europe', 'LI': 'Europe', 'LT': 'Europe', 'LU': 'Europe',
      'LV': 'Europe', 'MC': 'Europe', 'MD': 'Europe', 'ME': 'Europe', 'MK': 'Europe',
      'MT': 'Europe', 'NL': 'Europe', 'NO': 'Europe', 'PL': 'Europe', 'PT': 'Europe',
      'RO': 'Europe', 'RS': 'Europe', 'RU': 'Europe', 'SE': 'Europe', 'SI': 'Europe',
      'SK': 'Europe', 'SM': 'Europe', 'UA': 'Europe', 'VA': 'Europe',

      // North America
      'CA': 'North America', 'US': 'North America', 'MX': 'North America',
      'GT': 'North America', 'BZ': 'North America', 'SV': 'North America',
      'HN': 'North America', 'NI': 'North America', 'CR': 'North America',
      'PA': 'North America', 'CU': 'North America', 'JM': 'North America',
      'HT': 'North America', 'DO': 'North America',

      // Asia
      'CN': 'Asia', 'IN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'TH': 'Asia',
      'VN': 'Asia', 'PH': 'Asia', 'ID': 'Asia', 'MY': 'Asia', 'SG': 'Asia',
      'TW': 'Asia', 'HK': 'Asia', 'MO': 'Asia', 'KH': 'Asia', 'LA': 'Asia',
      'MM': 'Asia', 'BD': 'Asia', 'LK': 'Asia', 'NP': 'Asia', 'BT': 'Asia',
      'MN': 'Asia', 'KZ': 'Asia', 'UZ': 'Asia', 'TM': 'Asia', 'TJ': 'Asia',
      'KG': 'Asia', 'AF': 'Asia', 'PK': 'Asia', 'IR': 'Asia', 'IQ': 'Asia',
      'SY': 'Asia', 'LB': 'Asia', 'JO': 'Asia', 'IL': 'Asia', 'PS': 'Asia',
      'SA': 'Asia', 'YE': 'Asia', 'OM': 'Asia', 'AE': 'Asia', 'QA': 'Asia',
      'BH': 'Asia', 'KW': 'Asia', 'TR': 'Asia', 'GE': 'Asia', 'AM': 'Asia',
      'AZ': 'Asia',

      // Africa
      'DZ': 'Africa', 'AO': 'Africa', 'BJ': 'Africa', 'BW': 'Africa', 'BF': 'Africa',
      'BI': 'Africa', 'CM': 'Africa', 'CV': 'Africa', 'CF': 'Africa', 'TD': 'Africa',
      'KM': 'Africa', 'CG': 'Africa', 'CD': 'Africa', 'CI': 'Africa', 'DJ': 'Africa',
      'EG': 'Africa', 'GQ': 'Africa', 'ER': 'Africa', 'ET': 'Africa', 'GA': 'Africa',
      'GM': 'Africa', 'GH': 'Africa', 'GN': 'Africa', 'GW': 'Africa', 'KE': 'Africa',
      'LS': 'Africa', 'LR': 'Africa', 'LY': 'Africa', 'MG': 'Africa', 'MW': 'Africa',
      'ML': 'Africa', 'MR': 'Africa', 'MU': 'Africa', 'MA': 'Africa', 'MZ': 'Africa',
      'NA': 'Africa', 'NE': 'Africa', 'NG': 'Africa', 'RW': 'Africa', 'ST': 'Africa',
      'SN': 'Africa', 'SC': 'Africa', 'SL': 'Africa', 'SO': 'Africa', 'ZA': 'Africa',
      'SS': 'Africa', 'SD': 'Africa', 'SZ': 'Africa', 'TZ': 'Africa', 'TG': 'Africa',
      'TN': 'Africa', 'UG': 'Africa', 'ZM': 'Africa', 'ZW': 'Africa',

      // South America
      'AR': 'South America', 'BO': 'South America', 'BR': 'South America',
      'CL': 'South America', 'CO': 'South America', 'EC': 'South America',
      'FK': 'South America', 'GF': 'South America', 'GY': 'South America',
      'PY': 'South America', 'PE': 'South America', 'SR': 'South America',
      'UY': 'South America', 'VE': 'South America',

      // Oceania
      'AU': 'Oceania', 'NZ': 'Oceania', 'FJ': 'Oceania', 'PG': 'Oceania',
      'SB': 'Oceania', 'VU': 'Oceania', 'NC': 'Oceania', 'PF': 'Oceania',
      'WS': 'Oceania', 'TO': 'Oceania', 'TV': 'Oceania', 'KI': 'Oceania',
      'NR': 'Oceania', 'PW': 'Oceania', 'FM': 'Oceania', 'MH': 'Oceania',
    };

    return continentMap[countryCode?.toUpperCase()] || 'Unknown';
  }

  // Get global travel advisories
  async getTravelAdvisories(countryCode) {
    if (this.travelAdvisories.has(countryCode)) {
      const cached = this.travelAdvisories.get(countryCode);
      if (Date.now() - cached.timestamp < 86400000) { // 24 hours cache
        return cached.data;
      }
    }

    try {
      const advisories = await Promise.allSettled([
        this.getUSStateDeptAdvisory(countryCode),
      ]);

      const advisoryData = {
        us: advisories[0].status === 'fulfilled' ? advisories[0].value : null,
        lastUpdated: new Date().toISOString(),
      };

      this.travelAdvisories.set(countryCode, {
        data: advisoryData,
        timestamp: Date.now(),
      });

      return advisoryData;
    } catch (error) {
      console.error('Error fetching travel advisories:', error);
      return null;
    }
  }

  // Get US State Department travel advisory
  async getUSStateDeptAdvisory(countryCode) {
    try {
      const url = `${getApiUrl('TRAVEL_ADVISORIES')}/content/travel/en/traveladvisories/traveladvisories.json`;
      const response = await fetchWithProxy(url);
      
      const data = await response.json();
      const countryAdvisory = data.data?.find(
        item => item.iso2 === countryCode || item.country_name.toLowerCase().includes(countryCode.toLowerCase())
      );

      return countryAdvisory ? {
        level: countryAdvisory.advisory_level,
        message: countryAdvisory.advisory_message,
        lastUpdated: countryAdvisory.last_updated,
        source: 'US State Department',
      } : null;
    } catch (error) {
      console.error('US State Dept advisory error:', error);
      return null;
    }
  }

  // Get global crime statistics
  async getGlobalCrimeData(countryCode, city = null) {
    try {
      // Use World Bank safety indicators as primary source
      return await this.getWorldBankSafetyData(countryCode);
    } catch (error) {
      console.log('Crime data API unavailable');
      // NO FALLBACK - throw error as requested by user  
      throw new Error('Crime data API unavailable - real data required');
    }
  }

  // Get World Bank safety data
  async getWorldBankSafetyData(countryCode) {
    try {
      const indicators = [
        'VC.IHR.PSRC.P5', // Intentional homicides per 100,000 people
        'SH.STA.SUIC.P5', // Suicide mortality rate
        'SP.POP.TOTL',    // Total population
      ];

      const promises = indicators.map(indicator => {
        const url = `${getApiUrl('WORLD_BANK_DATA')}/v2/country/${countryCode}/indicator/${indicator}?format=json&date=2020:2023&per_page=1`;
        return fetchWithProxy(url).then(res => res.json());
      });

      const results = await Promise.all(promises);
      
      return {
        homicideRate: results[0]?.[1]?.[0]?.value || 'N/A',
        population: results[2]?.[1]?.[0]?.value || 'N/A',
        lastUpdated: results[0]?.[1]?.[0]?.date || 'N/A',
        source: 'World Bank',
      };
    } catch (error) {
      console.error('World Bank data error:', error);
      return null;
    }
  }

  // Get global emergency numbers
  async getEmergencyNumbers(countryCode) {
    if (!this.emergencyNumbers) {
      try {
        const url = `${getApiUrl('EMERGENCY_NUMBERS')}/datasets/emergency-numbers/master/data/emergency-numbers.json`;
        const response = await fetchWithProxy(url);
        this.emergencyNumbers = await response.json();
      } catch (error) {
        console.error('Error loading emergency numbers:', error);
        // NO FALLBACK - throw error as requested by user
        throw new Error('Emergency numbers API unavailable - real data required');
      }
    }

    const countryData = this.emergencyNumbers.find(
      item => item.country_code === countryCode
    );

    return countryData || {
      country_code: countryCode,
      police: '112', // European standard
      ambulance: '112',
      fire: '112',
      general: '112',
    };
  }

  // Get global news and events
  async getGlobalEvents(latitude, longitude, radius = 100) {
    try {
      // First try NewsAPI for recent safety-related news
      const countryInfo = await this.getCountryFromCoordinates(latitude, longitude);
      const newsService = await import('./newsService');
      const safetyNews = await newsService.default.getSafetyNews(
        countryInfo.country, 
        countryInfo.city
      );

      if (safetyNews.articles.length > 0) {
        return safetyNews.articles.map(article => ({
          title: article.title,
          url: article.url,
          date: article.publishedAt,
          source: article.source,
          relevance: article.safetyRelevance > 5 ? 'high' : 'medium',
          riskLevel: article.riskIndicators.length > 0 ? 'elevated' : 'normal',
        }));
      }

      // Try GDELT Project for global event monitoring
      const url = `https://api.gdeltproject.org/api/v2/geo/geo?query=&mode=artlist&maxrecords=10&format=json&near=${latitude},${longitude}&radius=${radius}`;
      const response = await fetchWithProxy(url);

      const data = await response.json();
      
      return data.articles?.map(article => ({
        title: article.title,
        url: article.url,
        date: article.seendate,
        tone: article.tone,
        location: article.location,
        relevance: article.socialimage ? 'high' : 'medium',
      })) || [];
    } catch (error) {
      console.error('Error fetching global events:', error);
      return [];
    }
  }

  // Get timezone for coordinates
  async getTimezone(latitude, longitude) {
    try {
      // Simple timezone estimation based on longitude
      const timezoneOffset = Math.round(longitude / 15);
      return `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;
    } catch (error) {
      return 'UTC';
    }
  }

  // Calculate global safety score
  calculateGlobalSafetyScore(countryData, crimeData, advisories, events) {
    let score = 70; // Base score

    // Adjust based on travel advisories
    if (advisories?.us?.level) {
      const levelAdjustments = { 1: 10, 2: 0, 3: -20, 4: -40 };
      score += levelAdjustments[advisories.us.level] || 0;
    }

    // Adjust based on crime data
    if (crimeData?.crimeIndex) {
      score -= Math.min(crimeData.crimeIndex / 2, 30);
    }

    // Adjust based on recent events
    if (events?.length > 5) {
      score -= 10; // High activity area
    }

    // Continent-based adjustments (general safety perception)
    const continentAdjustments = {
      'Europe': 5,
      'North America': 5,
      'Oceania': 10,
      'Asia': 0,
      'South America': -5,
      'Africa': -10,
    };
    score += continentAdjustments[countryData.continent] || 0;

    return Math.max(0, Math.min(100, score));
  }
}

export default new GlobalSafetyService();