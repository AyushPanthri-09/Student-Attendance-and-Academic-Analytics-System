import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, AlertCircle, Filter, RefreshCw } from 'lucide-react';

export default function TrendsPredictions() {
  const [trends, setTrends] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState(8);
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    fetchTrendsData();
  }, [weeks]);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const [trendsData, predictionsData, insightsData] = await Promise.all([
        analyticsService.getTrendAnalysis(weeks),
        analyticsService.getPredictions(),
        analyticsService.getInsights()
      ]);

      setTrends(trendsData);
      setPredictions(predictionsData);
      setInsights(insightsData.filter(i => i.type === 'PREDICTIVE'));
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendDirection = (current, previous) => {
    if (!previous) return 'stable';
    const diff = current - previous;
    if (diff > 3) return 'increasing';
    if (diff < -3) return 'decreasing';
    return 'stable';
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'increasing': return '#10b981';
      case 'decreasing': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentAttendance = trends.length > 0 ? trends[trends.length - 1]?.attendance : 0;
  const previousAttendance = trends.length > 1 ? trends[trends.length - 2]?.attendance : currentAttendance;
  const trendDirection = getTrendDirection(currentAttendance, previousAttendance);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trends & Predictions</h1>
          <p className="text-gray-600 mt-2">Attendance trends and future predictions</p>
        </div>
        <button
          onClick={fetchTrendsData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <div className="flex space-x-2">
              {[4, 8, 12, 16].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeeks(w)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    weeks === w
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {w} Weeks
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Attendance</p>
              <p className={`text-2xl font-bold ${
                currentAttendance >= 75 ? 'text-green-600' : 
                currentAttendance >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {currentAttendance.toFixed(1)}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              trendDirection === 'increasing' ? 'bg-green-100' :
              trendDirection === 'decreasing' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                trendDirection === 'increasing' ? 'text-green-600' :
                trendDirection === 'decreasing' ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Trend: <span className={`font-medium ${
              trendDirection === 'increasing' ? 'text-green-600' :
              trendDirection === 'decreasing' ? 'text-red-600' : 'text-gray-600'
            }`}>{trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Predicted (Next Month)</p>
              <p className="text-2xl font-bold text-blue-600">
                {predictions[0]?.predictedValue?.toFixed(1) || currentAttendance.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Confidence: {((predictions[0]?.confidence || 0.7) * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trend Slope</p>
              <p className={`text-2xl font-bold ${
                trendDirection === 'increasing' ? 'text-green-600' :
                trendDirection === 'decreasing' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trendDirection === 'increasing' ? '+' : trendDirection === 'decreasing' ? '-' : ''}
                {Math.abs(currentAttendance - previousAttendance).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Per week average
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)}%`, 'Attendance']}
                labelFormatter={(label) => label}
              />
              <ReferenceLine y={75} stroke="#10b981" strokeDasharray="3 3" label="Safe (75%)" />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label="Warning (60%)" />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predictions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Cards */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictions</h3>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{prediction.metric}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {(prediction.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {prediction.currentValue?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-xs text-gray-500">Predicted</p>
                    <p className={`text-lg font-semibold ${
                      prediction.predictedValue >= 75 ? 'text-green-600' :
                      prediction.predictedValue >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {prediction.predictedValue?.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{prediction.explanation}</p>
              </div>
            ))}
            {predictions.length === 0 && (
              <p className="text-gray-500 text-center py-4">No predictions available</p>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Insights</h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    {insight.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{insight.description}</p>
                {insight.recommendation && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Action:</strong> {insight.recommendation}
                  </p>
                )}
              </div>
            ))}
            {insights.length === 0 && (
              <p className="text-gray-500 text-center py-4">No insights available</p>
            )}
          </div>
        </div>
      </div>

      {/* What-If Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What-If Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">If attendance stays the same...</h4>
            <p className="text-sm text-gray-600">
              {trendDirection === 'decreasing' 
                ? `Risk of dropping below 60% within ${Math.ceil((currentAttendance - 60) / Math.abs(currentAttendance - previousAttendance))} weeks`
                : trendDirection === 'increasing'
                ? "Attendance will continue to improve"
                : "Attendance will remain stable"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">If attendance improves by 5%...</h4>
            <p className="text-sm text-gray-600">
              {(currentAttendance + 5) >= 75 
                ? "Most students would move to Safe category"
                : (currentAttendance + 5) >= 60
                ? "Many students would move to Warning category"
                : "Still needs more improvement to reach safe levels"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">If attendance drops by 5%...</h4>
            <p className="text-sm text-gray-600">
              {(currentAttendance - 5) < 60 
                ? "Many students would fall into Critical risk"
                : (currentAttendance - 5) < 75
                ? "More students would move to Warning category"
                : "Would still maintain safe attendance levels"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
