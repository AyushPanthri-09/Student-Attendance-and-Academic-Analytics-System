import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Users, Target, Zap, Award, Eye, Lightbulb } from 'lucide-react';
import advancedAnalyticsService from '../services/advancedAnalyticsService';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import ChartNotation from '../components/ChartNotation';
import useChartScale from '../hooks/useChartScale';

export default function AIInsightsDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [sentiment, setSentiment] = useState({});
  const [heatmaps, setHeatmaps] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const chartScale = useChartScale();

  useEffect(() => {
    fetchAIInsights();
    const interval = setInterval(fetchRealTimeData, 10000); // Update every 10 seconds
    const unsubscribe = onAnalyticsDataChanged(() => {
      fetchAIInsights();
    });
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const [predictionsData, anomaliesData, recommendationsData, sentimentData, heatmapsData, realTimeData] = await Promise.all([
        advancedAnalyticsService.getDropoutPredictions(),
        advancedAnalyticsService.getAnomalyDetection(),
        advancedAnalyticsService.getGeneralRecommendations(),
        advancedAnalyticsService.getSentimentAnalysis(),
        advancedAnalyticsService.getAttendanceHeatmaps('30d'),
        advancedAnalyticsService.getRealTimeMetrics()
      ]);

      setPredictions(predictionsData);
      setAnomalies(anomaliesData);
      setRecommendations(recommendationsData);
      setSentiment(sentimentData);
      setHeatmaps(heatmapsData);
      setRealTimeMetrics(realTimeData);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const data = await advancedAnalyticsService.getRealTimeMetrics();
      setRealTimeMetrics(data);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore >= 0.8) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle };
    if (riskScore >= 0.6) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle };
    if (riskScore >= 0.4) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: TrendingUp };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100', icon: Users };
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.6) return 'text-emerald-700 bg-emerald-100';
    if (sentiment > 0.3) return 'text-sky-700 bg-sky-100';
    return 'text-rose-700 bg-rose-100';
  };

  const formatCompactNumber = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return String(value || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Insights Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Advanced analytics powered by machine learning</p>
        </div>
        <div className="flex gap-2">
          {['overview', 'predictions', 'anomalies', 'recommendations'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === view
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Active Students</p>
              <p className="text-3xl font-bold mt-1">{formatCompactNumber(realTimeMetrics.activeStudents || 0)}</p>
            </div>
            <Users className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, transitionDelay: 0.1 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Engagement Rate</p>
              <p className="text-3xl font-bold mt-1">{(realTimeMetrics.engagementRate || 0).toFixed(2)}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, transitionDelay: 0.2 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Predictions Accuracy</p>
              <p className="text-3xl font-bold mt-1 drop-shadow-sm">{(realTimeMetrics.accuracy || 0).toFixed(2)}%</p>
            </div>
            <Zap className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, transitionDelay: 0.3 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Anomalies Detected</p>
              <p className="text-3xl font-bold mt-1">{anomalies.length || 0}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dropout Predictions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Dropout Risk Predictions
            </h2>
            <div className="space-y-3">
              {predictions.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
                  No predictions available at this time. New prediction data will appear after model sync.
                </div>
              )}
              {predictions.slice(0, 5).map((student, index) => {
                const risk = getRiskLevel(student.riskScore);
                const RiskIcon = risk.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${risk.bg}`}>
                        <RiskIcon className={`w-5 h-5 ${risk.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.rollNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${risk.color}`}>{risk.level}</p>
                      <p className="text-sm text-gray-500">{(student.riskScore * 100).toFixed(2)}% risk</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
                  No recommendations available yet. The engine will suggest actions once enough data is collected.
                </div>
              )}
              {recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-medium text-gray-800">{rec.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      Impact: {rec.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Sentiment Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-1">Student Sentiment Analysis</h2>
        <p className="text-sm text-gray-500 mb-4">Source: daily student feedback check-ins and response summaries.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${getSentimentColor(sentiment.positive)}`}>
            <p className="font-semibold">Positive Sentiment</p>
            <p className="text-2xl font-bold mt-1">{((sentiment.positive || 0) * 100).toFixed(2)}%</p>
          </div>
          <div className={`p-4 rounded-lg ${getSentimentColor(sentiment.neutral - 0.5)}`}>
            <p className="font-semibold">Neutral Sentiment</p>
            <p className="text-2xl font-bold mt-1">{((sentiment.neutral || 0) * 100).toFixed(2)}%</p>
          </div>
          <div className={`p-4 rounded-lg ${getSentimentColor(sentiment.negative - 0.5)}`}>
            <p className="font-semibold">Negative Sentiment</p>
            <p className="text-2xl font-bold mt-1">{((sentiment.negative || 0) * 100).toFixed(2)}%</p>
          </div>
        </div>
      </motion.div>

      {/* Attendance Heatmap */}
      {heatmaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Heatmap Analysis</h2>
          <div className="mb-4">
            <ChartNotation
              title="Chart Notation"
              items={[
                { label: 'X-axis: Date' },
                { label: 'Y-axis: Attendance level' },
                { label: 'Area Fill: Trend intensity', color: '#8b5cf6' },
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={heatmaps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: chartScale.axisFontSize }} />
              <YAxis tick={{ fontSize: chartScale.axisFontSize }} />
              <Tooltip />
              <Area type="monotone" dataKey="attendance" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
