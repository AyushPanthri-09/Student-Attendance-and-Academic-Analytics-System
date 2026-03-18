import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InsightsPanel({ data, riskList, moduleType }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/analytics/insights');
      setInsights(response.data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'DESCRIPTIVE': return '📊';
      case 'DIAGNOSTIC': return '🔍';
      case 'PREDICTIVE': return '�';
      default: return '💡';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'DESCRIPTIVE': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'DIAGNOSTIC': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'PREDICTIVE': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <span className="mr-2">🧠</span>
          AI Insights & Recommendations
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <span className="mr-2">🧠</span>
        AI Insights & Recommendations
      </h3>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-gray-500">AI is analyzing your data... Insights will appear here soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border-l-4 ${getInsightColor(insight.type)} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-start">
                <span className="text-2xl mr-4">{getInsightIcon(insight.type)}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-2">{insight.title}</h4>
                  <p className="text-gray-700 mb-3">{insight.description}</p>
                  {insight.recommendation && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-sm mb-1">💡 Recommendation:</p>
                      <p className="text-sm text-gray-600">{insight.recommendation}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-gray-500">
                      {insight.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}