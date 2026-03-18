import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/analytics';

const analyticsService = {
  // Overview Dashboard
  getOverviewMetrics: async () => {
    const response = await axios.get(`${API_BASE_URL}/overview`);
    return response.data;
  },

  // Department Analytics
  getDepartmentAnalytics: async () => {
    const response = await axios.get(`${API_BASE_URL}/departments`);
    return response.data;
  },

  // Subject Analytics
  getSubjectAnalytics: async () => {
    const response = await axios.get(`${API_BASE_URL}/subjects`);
    return response.data;
  },

  // Risk Analysis (paginated, supports search and risk filter)
  getRiskAnalysis: async (page = 0, size = 20, search = null, risk = null) => {
    const params = { page, size };
    if (search) params.search = search;
    if (risk) params.risk = risk;
    const response = await axios.get(`${API_BASE_URL}/risk-analysis`, { params });
    return response.data;
  },

  // Trend Analysis
  getTrendAnalysis: async (weeks = 8) => {
    const response = await axios.get(`${API_BASE_URL}/trends?weeks=${weeks}`);
    return response.data;
  },

  // Insights
  getInsights: async () => {
    const response = await axios.get(`${API_BASE_URL}/insights`);
    return response.data;
  },

  // Predictions
  getPredictions: async () => {
    const response = await axios.get(`${API_BASE_URL}/predictions`);
    return response.data;
  }
};

export default analyticsService;
