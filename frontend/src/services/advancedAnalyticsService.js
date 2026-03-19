import axios from 'axios';

const API = 'http://localhost:8080/api/analytics';

class AdvancedAnalyticsService {
  // Real-time monitoring
  async getRealTimeMetrics() {
    const response = await axios.get(`${API}/realtime`);
    return response.data;
  }

  // Predictive analytics
  async getDropoutPredictions() {
    const response = await axios.get(`${API}/predictions/dropout`);
    return response.data;
  }

  async getPerformanceForecasts() {
    const response = await axios.get(`${API}/forecasts/performance`);
    return response.data;
  }

  // Advanced insights
  async getBehavioralPatterns() {
    const response = await axios.get(`${API}/patterns/behavioral`);
    return response.data;
  }

  async getEngagementMetrics() {
    const response = await axios.get(`${API}/engagement/metrics`);
    return response.data;
  }

  // Comparative analytics
  async getComparativeAnalysis(departmentIds) {
    const response = await axios.post(`${API}/comparative`, { departmentIds });
    return response.data;
  }

  // Anomaly detection
  async getAnomalyDetection() {
    const response = await axios.get(`${API}/anomalies`);
    return response.data;
  }

  // Advanced reporting
  async generateExecutiveReport(timeRange) {
    const response = await axios.get(`${API}/reports/executive`, {
      params: { timeRange },
      responseType: 'blob'
    });
    return response.data;
  }

  // AI-powered recommendations
  async getRecommendations(studentId) {
    const response = await axios.get(`${API}/recommendations/${studentId}`);
    return response.data;
  }

  async getGeneralRecommendations() {
    const response = await axios.get(`${API}/recommendations`);
    return response.data;
  }

  // Sentiment analysis
  async getSentimentAnalysis() {
    const response = await axios.get(`${API}/sentiment`);
    return response.data;
  }

  // Attendance heatmaps
  async getAttendanceHeatmaps(timeRange) {
    const response = await axios.get(`${API}/heatmaps/attendance`, {
      params: { timeRange }
    });
    return response.data;
  }
}

export default new AdvancedAnalyticsService();
