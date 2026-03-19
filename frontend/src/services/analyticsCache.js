// Analytics Data Cache - Prevents redundant API calls
const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cacheManager = {
  set: (key, data) => {
    cache[key] = {
      data,
      timestamp: Date.now()
    };
  },

  get: (key) => {
    const cached = cache[key];
    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete cache[key];
      return null;
    }

    return cached.data;
  },

  clear: (key) => {
    if (key) {
      delete cache[key];
    } else {
      Object.keys(cache).forEach(k => delete cache[k]);
    }
  },

  isValid: (key) => {
    return cacheManager.get(key) !== null;
  }
};

// Optimized analytics service with caching
import axios from 'axios';

const API_BASE_URL = '/api/analytics';

const analyticsService = {
  // Overview Dashboard - High priority, cache it
  getOverviewMetrics: async () => {
    const cacheKey = 'overview-metrics';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/overview`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached; // Fallback to stale data
      throw error;
    }
  },

  // Department Analytics - Medium priority
  getDepartmentAnalytics: async () => {
    const cacheKey = 'department-analytics';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  },

  // Subject Analytics - Medium priority
  getSubjectAnalytics: async () => {
    const cacheKey = 'subject-analytics';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/subjects?limit=20`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  },

  // Risk Analysis - Paginated. Load small pages frequently
  getRiskAnalysis: async (page = 0, size = 20, search = null, risk = null) => {
    const params = { page, size };
    if (search) params.search = search;
    if (risk) params.risk = risk;

    // Don't cache paginated results to always get fresh data
    try {
      const response = await axios.get(`${API_BASE_URL}/risk-analysis`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Trend Analysis - Cache with key including weeks
  getTrendAnalysis: async (weeks = 8) => {
    const cacheKey = `trend-analysis-${weeks}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/trends?weeks=${weeks}`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      throw error;
    }
  },

  // Insights - Lower priority, can be lazy loaded
  getInsights: async () => {
    const cacheKey = 'insights';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/insights?limit=5`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      return [];
    }
  },

  // Real-time Metrics - Don't cache, always fresh
  getRealTimeMetrics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/realtime`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Anomalies - Lower priority, can fail gracefully
  getAnomalies: async () => {
    const cacheKey = 'anomalies';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/anomalies?limit=5`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      return [];
    }
  },

  // Recommendations - Lower priority
  getGeneralRecommendations: async () => {
    const cacheKey = 'recommendations';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations?limit=5`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      return [];
    }
  },

  // Sentiment Analysis - Lower priority
  getSentimentAnalysis: async () => {
    const cacheKey = 'sentiment-analysis';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${API_BASE_URL}/sentiment`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      if (cached) return cached;
      return { positive: 0.33, neutral: 0.34, negative: 0.33 };
    }
  },

  // Clear all cache
  clearCache: () => {
    cacheManager.clear();
  },

  // Invalidate specific cache key
  invalidateCache: (key) => {
    cacheManager.clear(key);
  }
};

export default analyticsService;
