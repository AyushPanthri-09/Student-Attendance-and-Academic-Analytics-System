import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import analyticsService from '../services/analyticsService';
import { Users, BookOpen, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function OverviewDashboard() {
  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [riskAnalytics, setRiskAnalytics] = useState({ safe: 0, warning: 0, critical: 0, content: [] });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [overview, departments, riskData, insightsData] = await Promise.all([
        analyticsService.getOverviewMetrics(),
        analyticsService.getDepartmentAnalytics(),
        analyticsService.getRiskAnalysis(),
        analyticsService.getInsights()
      ]);

      setOverviewMetrics(overview);
      setDepartmentAnalytics(departments);
      setRiskAnalytics(riskData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate risk distribution from actual risk data (SINGLE SOURCE OF TRUTH)
  const riskData = riskAnalytics?.content || [];
  const safeCount = riskData.filter(student => student.riskLevel === 'LOW').length;
  const warningCount = riskData.filter(student => student.riskLevel === 'MEDIUM').length;
  const criticalCount = riskData.filter(student => student.riskLevel === 'HIGH').length;
  const atRiskCount = warningCount + criticalCount;
  const totalStudents = (safeCount + warningCount + criticalCount) || overviewMetrics?.totalStudents || 0;

  const riskDistribution = [
    { name: 'Safe (≥75%)', value: safeCount, color: '#10b981' },
    { name: 'Warning (60-74%)', value: warningCount, color: '#f59e0b' },
    { name: 'Critical (<60%)', value: criticalCount, color: '#ef4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview Dashboard</h1>
        <p className="text-gray-600 mt-2">System-wide attendance analytics and insights</p>
      </div>

      {/* Key Metrics Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:bg-white/90 transition-all duration-300"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:bg-white/90 transition-all duration-300"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewMetrics?.averageAttendance?.toFixed(1) || 0}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:bg-white/90 transition-all duration-300"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">At Risk Students</p>
              <p className="text-2xl font-bold text-red-600">{atRiskCount}</p>
              <p className="text-xs text-gray-500">
                {totalStudents > 0 ? ((atRiskCount / totalStudents) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20 hover:bg-white/90 transition-all duration-300"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{overviewMetrics?.subjects || 0}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>
      </motion.div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${value} (${((value/totalStudents)*100).toFixed(1)}%)`}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{safeCount}</p>
              <p className="text-xs text-gray-600">Safe (≥75%)</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              <p className="text-xs text-gray-600">Warning (60-74%)</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-xs text-gray-600">Critical (&lt;60%)</p>
            </div>
          </div>
        </div>

        {/* Department Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentAnalytics.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departmentName" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageAttendance" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="space-y-4">
          {insights.slice(0, 3).map((insight, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  insight.type === 'DESCRIPTIVE' ? 'bg-blue-100 text-blue-800' :
                  insight.type === 'DIAGNOSTIC' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {insight.type}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{insight.description}</p>
              {insight.recommendation && (
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Recommendation:</strong> {insight.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
