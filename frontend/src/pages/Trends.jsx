import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import analyticsService from "../services/analyticsService";

export default function Trends() {
  const [trendData, setTrendData] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [trends, preds] = await Promise.all([
          analyticsService.getTrendAnalysis(8),
          analyticsService.getPredictions(),
        ]);

        setTrendData(trends || []);
        setPredictions(preds || []);
      } catch (error) {
        console.error("Error loading trend and prediction data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trends & Predictions</h1>
        <p className="text-gray-600 mt-2">
          Visualize recent attendance trends and see predicted attendance for the upcoming period.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Attendance Trend</h2>
            <span className="text-sm text-gray-500">Last 8 Weeks</span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendancePercentage"
                  name="Attendance %"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Predictions</h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.length === 0 ? (
                <p className="text-sm text-gray-600">No prediction data available.</p>
              ) : (
                predictions.map((p, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{p.metric}</p>
                      <span className="text-xs text-gray-500 capitalize">
                        {p.timeframe.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Current</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {p.currentValue?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500">Predicted</p>
                        <p className="text-2xl font-bold text-green-600">
                          {p.predictedValue?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    {p.explanation && (
                      <p className="mt-3 text-sm text-gray-600">{p.explanation}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
