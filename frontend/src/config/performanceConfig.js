// Frontend Performance Optimization Config
export const PERFORMANCE_CONFIG = {
  // Data loading strategy
  DATA_LOADING: {
    // Priority 1: Essential data (loaded immediately)
    PRIORITY_ENDPOINTS: ['overview', 'realtime'],
    
    // Priority 2: Charts data (loaded after priority)
    CHARTS_ENDPOINTS: ['departments', 'subjects', 'trends'],
    
    // Priority 3: Secondary data (loaded in background)
    SECONDARY_ENDPOINTS: ['insights', 'anomalies', 'recommendations', 'sentiment'],
    
    // Loading delays between stages (ms)
    STAGE_DELAY: 0, // No delay - load all stages immediately but sequentially
  },

  // API call optimization
  API_OPTIMIZATION: {
    // Reduce data fetched for each endpoint
    RISK_PAGE_SIZE: 100, // Reduced from 500
    INSIGHTS_LIMIT: 5,
    ANOMALIES_LIMIT: 5,
    RECOMMENDATIONS_LIMIT: 5,
    SUBJECTS_LIMIT: 20,
    
    // Timeout settings
    REQUEST_TIMEOUT: 10000,
    RETRY_ATTEMPTS: 1, // Don't retry on first load
  },

  // Cache settings
  CACHE: {
    ENABLED: true,
    DURATION: 5 * 60 * 1000, // 5 minutes
    EXCLUDE_REALTIME: true, // Don't cache real-time metrics
  },

  // Component rendering optimization
  RENDERING: {
    // Use React.memo for heavy components
    MEMOIZE_CHARTS: true,
    
    // Defer non-critical renders
    DEFER_SENTIMENT: true,
    DEFER_ANOMALIES: true,
    DEFER_RECOMMENDATIONS: true,
    
    // Animation settings
    ANIMATIONS_ENABLED: true,
    ANIMATION_DURATION: 300, // ms
  },

  // Batch requests
  BATCH_REQUESTS: {
    ENABLED: true,
    BATCH_SIZE: 3,
  }
};

export default PERFORMANCE_CONFIG;
