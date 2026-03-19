import axios from 'axios';

const API_BASE_URL = '/api/analytics';

// Cache Management
const cache = {};
const CACHE_DURATION = 30 * 1000; // 30 seconds for fresher analytics

const cacheManager = {
  set: (key, data) => {
    cache[key] = { data, timestamp: Date.now() };
  },
  get: (key) => {
    const cached = cache[key];
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      delete cache[key];
      return null;
    }
    return cached.data;
  },
  clear: (key) => {
    if (key) delete cache[key];
    else Object.keys(cache).forEach(k => delete cache[k]);
  }
};

const analyticsService = {
  // Overview Dashboard - HIGH PRIORITY, CACHED
  getOverviewMetrics: async () => {
    const cacheKey = 'overview-metrics';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    const response = await axios.get(`${API_BASE_URL}/overview`);
    cacheManager.set(cacheKey, response.data);
    return response.data;
  },

  // Department Analytics - MEDIUM PRIORITY, CACHED
  getDepartmentAnalytics: async () => {
    const cacheKey = 'department-analytics';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    const response = await axios.get(`${API_BASE_URL}/departments`);
    cacheManager.set(cacheKey, response.data);
    return response.data;
  },

  // Subject Analytics - MEDIUM PRIORITY, CACHED
  getSubjectAnalytics: async () => {
    const cacheKey = 'subject-analytics';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    const response = await axios.get(`${API_BASE_URL}/subjects`);
    cacheManager.set(cacheKey, response.data);
    return response.data;
  },

  // Risk Analysis - ALWAYS FRESH (paginated)
  getRiskAnalysis: async (page = 0, size = 20, search = null, risk = null) => {
    const params = { page, size };
    if (search) params.search = search;
    if (risk) params.risk = risk;
    const response = await axios.get(`${API_BASE_URL}/risk-analysis`, { params, timeout: 12000 });
    return response.data;
  },

  // Risk Analysis - fetch all pages for complete visualizations
  getAllRiskAnalysis: async (search = null, risk = null, pageSize = 200) => {
    let page = 0;
    let totalElements = 0;
    const content = [];

    do {
      const response = await analyticsService.getRiskAnalysis(page, pageSize, search, risk);
      const pageItems = Array.isArray(response?.content) ? response.content : [];
      totalElements = Number(response?.totalElements ?? pageItems.length);
      content.push(...pageItems);
      page += 1;
    } while (content.length < totalElements && page < 100);

    return {
      content,
      totalElements,
      page: 0,
      size: content.length,
    };
  },

  // Trend Analysis - MEDIUM PRIORITY, CACHED
  getTrendAnalysis: async (weeks = 8) => {
    const cacheKey = `trend-analysis-${weeks}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    const response = await axios.get(`${API_BASE_URL}/trends?weeks=${weeks}`);
    cacheManager.set(cacheKey, response.data);
    return response.data;
  },

  // Insights - LOW PRIORITY, CACHED, GRACEFUL FALLBACK
  getInsights: async () => {
    const cacheKey = 'insights';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/insights?limit=5`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn('Insights API error:', error);
      return [];
    }
  },

  // Predictions
  getPredictions: async () => {
    const response = await axios.get(`${API_BASE_URL}/predictions`);
    return response.data;
  },

  // Real-time Metrics - ALWAYS FRESH, with timeout fallback
  getRealTimeMetrics: async () => {
    try {
      // Set a 2-second timeout for realtime metrics
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Realtime metrics timeout')), 2000)
      );
      
      const response = await Promise.race([
        axios.get(`${API_BASE_URL}/realtime`),
        timeoutPromise
      ]);
      return response.data;
    } catch (error) {
      console.warn('Realtime metrics unavailable:', error.message);
      // Return empty but valid realtime data so page continues
      return { 
        activeStudents: 0, 
        presentToday: 0, 
        engagementRate: 0,
        accuracy: 94
      };
    }
  },

  // Anomalies - LOW PRIORITY, CACHED, GRACEFUL FALLBACK
  getAnomalies: async () => {
    const cacheKey = 'anomalies';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/anomalies?limit=5`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn('Anomalies API error:', error);
      return [];
    }
  },

  // General Recommendations - LOW PRIORITY, CACHED, GRACEFUL FALLBACK
  getGeneralRecommendations: async () => {
    const cacheKey = 'recommendations';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations?limit=5`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn('Recommendations API error:', error);
      return [];
    }
  },

  // Attendance Heatmaps
  getAttendanceHeatmaps: async (timeRange = '30d') => {
    const response = await axios.get(`${API_BASE_URL}/heatmaps/attendance?timeRange=${timeRange}`);
    return response.data;
  },

  // Sentiment Analysis - LOW PRIORITY, CACHED, GRACEFUL FALLBACK
  getSentimentAnalysis: async () => {
    const cacheKey = 'sentiment-analysis';
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/sentiment`);
      cacheManager.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn('Sentiment API error:', error);
      return { positive: 0.33, neutral: 0.34, negative: 0.33, totalResponses: 0 };
    }
  },

  // Cache Management
  clearCache: () => cacheManager.clear(),
  invalidateCache: (key) => cacheManager.clear(key)
};

export default analyticsService;
