// Global News Service for Travel Safety Intelligence
import { API_CONFIG } from '../config/apiConfig';

class NewsService {
  constructor() {
    this.newsCache = new Map();
    this.safetyKeywords = [
      'crime', 'safety', 'security', 'terrorism', 'protest', 'violence',
      'emergency', 'disaster', 'outbreak', 'warning', 'alert', 'incident',
      'attack', 'theft', 'robbery', 'scam', 'fraud', 'danger', 'risk',
      'travel advisory', 'border', 'closure', 'strike', 'demonstration'
    ];
  }

  // Get safety-related news for a specific location
  async getSafetyNews(country, city = null, radius = 50) {
    const cacheKey = `${country}-${city || 'national'}`;
    
    if (this.newsCache.has(cacheKey)) {
      const cached = this.newsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }

    try {
      const searchQuery = this.buildSafetyQuery(country, city);
      const newsData = await this.fetchNewsData(searchQuery);
      const processedNews = this.processSafetyNews(newsData, country, city);

      this.newsCache.set(cacheKey, {
        data: processedNews,
        timestamp: Date.now(),
      });

      return processedNews;
    } catch (error) {
      console.error('Error fetching safety news:', error);
      return {
        articles: [],
        safetyAlerts: [],
        riskLevel: 'unknown',
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // Build search query for safety-related news
  buildSafetyQuery(country, city) {
    const location = city ? `${city} ${country}` : country;
    const safetyTerms = this.safetyKeywords.slice(0, 5).join(' OR ');
    return `(${location}) AND (${safetyTerms})`;
  }

  // Fetch news data from NewsAPI
  async fetchNewsData(query) {
    const params = new URLSearchParams({
      q: query,
      sortBy: 'publishedAt',
      pageSize: 20,
      language: 'en',
      apiKey: API_CONFIG.NEWS_API.apiKey,
    });

    const response = await fetch(
      `${API_CONFIG.NEWS_API.baseUrl}/everything?${params}`,
      {
        signal: AbortSignal.timeout(API_CONFIG.NEWS_API.timeout),
        headers: {
          'User-Agent': 'Roamsafe/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Process news data for safety intelligence
  processSafetyNews(newsData, country, city) {
    if (!newsData.articles || newsData.articles.length === 0) {
      return {
        articles: [],
        safetyAlerts: [],
        riskLevel: 'low',
        lastUpdated: new Date().toISOString(),
      };
    }

    const articles = newsData.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
      safetyRelevance: this.calculateSafetyRelevance(article),
      riskIndicators: this.extractRiskIndicators(article),
    }));

    // Sort by safety relevance
    articles.sort((a, b) => b.safetyRelevance - a.safetyRelevance);

    const safetyAlerts = this.generateSafetyAlerts(articles);
    const riskLevel = this.calculateAreaRiskLevel(articles);

    return {
      articles: articles.slice(0, 10), // Top 10 most relevant
      safetyAlerts,
      riskLevel,
      lastUpdated: new Date().toISOString(),
      totalArticles: newsData.totalResults,
    };
  }

  // Calculate safety relevance score for an article
  calculateSafetyRelevance(article) {
    let score = 0;
    const text = `${article.title} ${article.description}`.toLowerCase();

    // High-priority safety keywords
    const highPriorityKeywords = ['terrorism', 'attack', 'emergency', 'disaster', 'outbreak'];
    const mediumPriorityKeywords = ['crime', 'violence', 'protest', 'strike', 'warning'];
    const lowPriorityKeywords = ['safety', 'security', 'travel advisory', 'incident'];

    highPriorityKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 10;
    });

    mediumPriorityKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 5;
    });

    lowPriorityKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 2;
    });

    // Recency bonus
    const publishedDate = new Date(article.publishedAt);
    const hoursAgo = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 24) score += 5;
    if (hoursAgo < 6) score += 10;

    return score;
  }

  // Extract risk indicators from article
  extractRiskIndicators(article) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const indicators = [];

    const riskPatterns = {
      'immediate_danger': ['bomb', 'explosion', 'shooting', 'attack', 'terrorist'],
      'civil_unrest': ['protest', 'riot', 'demonstration', 'strike', 'violence'],
      'health_risk': ['outbreak', 'disease', 'virus', 'pandemic', 'quarantine'],
      'natural_disaster': ['earthquake', 'flood', 'hurricane', 'tsunami', 'wildfire'],
      'crime_increase': ['crime wave', 'robbery', 'theft', 'murder', 'assault'],
      'travel_disruption': ['border closure', 'flight cancelled', 'transport strike'],
    };

    Object.entries(riskPatterns).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          indicators.push({
            category,
            keyword,
            severity: this.getKeywordSeverity(keyword),
          });
        }
      });
    });

    return indicators;
  }

  // Get severity level for a keyword
  getKeywordSeverity(keyword) {
    const severityMap = {
      'bomb': 'critical',
      'explosion': 'critical',
      'shooting': 'critical',
      'attack': 'critical',
      'terrorist': 'critical',
      'outbreak': 'high',
      'earthquake': 'high',
      'riot': 'high',
      'protest': 'medium',
      'strike': 'medium',
      'theft': 'low',
      'robbery': 'medium',
    };

    return severityMap[keyword] || 'low';
  }

  // Generate safety alerts from news articles
  generateSafetyAlerts(articles) {
    const alerts = [];
    const criticalArticles = articles.filter(a => 
      a.riskIndicators.some(r => r.severity === 'critical')
    );
    const highRiskArticles = articles.filter(a => 
      a.riskIndicators.some(r => r.severity === 'high')
    );

    if (criticalArticles.length > 0) {
      alerts.push({
        level: 'critical',
        message: `🚨 CRITICAL: ${criticalArticles.length} security incident(s) reported`,
        articles: criticalArticles.slice(0, 3),
        action: 'Avoid the area and contact local authorities',
      });
    }

    if (highRiskArticles.length > 0) {
      alerts.push({
        level: 'high',
        message: `⚠️ HIGH RISK: ${highRiskArticles.length} significant incident(s) reported`,
        articles: highRiskArticles.slice(0, 3),
        action: 'Exercise extreme caution and monitor situation',
      });
    }

    // Check for travel disruptions
    const travelDisruptions = articles.filter(a =>
      a.riskIndicators.some(r => r.category === 'travel_disruption')
    );

    if (travelDisruptions.length > 0) {
      alerts.push({
        level: 'medium',
        message: `✈️ TRAVEL ALERT: ${travelDisruptions.length} transport disruption(s) reported`,
        articles: travelDisruptions.slice(0, 2),
        action: 'Check transport schedules and have backup plans',
      });
    }

    return alerts;
  }

  // Calculate overall risk level for the area
  calculateAreaRiskLevel(articles) {
    if (articles.length === 0) return 'low';

    const criticalCount = articles.filter(a => 
      a.riskIndicators.some(r => r.severity === 'critical')
    ).length;

    const highCount = articles.filter(a => 
      a.riskIndicators.some(r => r.severity === 'high')
    ).length;

    const totalRelevantArticles = articles.filter(a => a.safetyRelevance > 5).length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (totalRelevantArticles > 5) return 'medium';
    return 'low';
  }

  // Get trending safety topics globally
  async getTrendingSafetyTopics() {
    try {
      const params = new URLSearchParams({
        q: this.safetyKeywords.slice(0, 3).join(' OR '),
        sortBy: 'popularity',
        pageSize: 50,
        language: 'en',
        apiKey: API_CONFIG.NEWS_API.apiKey,
      });

      const response = await fetch(
        `${API_CONFIG.NEWS_API.baseUrl}/everything?${params}`,
        { signal: AbortSignal.timeout(API_CONFIG.NEWS_API.timeout) }
      );

      const data = await response.json();
      
      return this.analyzeTrendingTopics(data.articles || []);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  // Analyze trending safety topics
  analyzeTrendingTopics(articles) {
    const topicCounts = {};
    
    articles.forEach(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      
      this.safetyKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
        }
      });
    });

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({
        topic,
        count,
        severity: this.getKeywordSeverity(topic),
      }));
  }

  // Get news headlines for a specific country
  async getCountryHeadlines(countryCode) {
    try {
      const params = new URLSearchParams({
        country: countryCode.toLowerCase(),
        category: 'general',
        pageSize: 10,
        apiKey: API_CONFIG.NEWS_API.apiKey,
      });

      const response = await fetch(
        `${API_CONFIG.NEWS_API.baseUrl}/top-headlines?${params}`,
        { signal: AbortSignal.timeout(API_CONFIG.NEWS_API.timeout) }
      );

      const data = await response.json();
      
      return data.articles?.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
      })) || [];
    } catch (error) {
      console.error('Error fetching country headlines:', error);
      return [];
    }
  }

  // Clear cache
  clearCache() {
    this.newsCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.newsCache.size,
      keys: Array.from(this.newsCache.keys()),
    };
  }
}

export default new NewsService();