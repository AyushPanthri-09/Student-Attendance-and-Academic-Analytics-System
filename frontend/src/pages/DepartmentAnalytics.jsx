import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Building2, Users, BookOpen, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export default function DepartmentAnalytics() {
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDepartmentAnalytics();
      setDepartmentAnalytics(data);
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (insight) => {
    if (!insight) return <Minus className="h-4 w-4 text-gray-500" />;
    if (insight.toLowerCase().includes('low') || insight.toLowerCase().includes('poor')) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else if (insight.toLowerCase().includes('good') || insight.toLowerCase().includes('high')) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Department Analytics</h1>
        <p className="text-gray-600 mt-2">Attendance performance analysis by department</p>
      </div>

      {/* Department Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Attendance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departmentAnalytics} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="departmentName" 
              angle={-45} 
              textAnchor="end" 
              height={80}
            />
            <YAxis 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(1)}%`, 'Attendance']}
            />
            <Legend />
            <Bar 
              dataKey="averageAttendance" 
              fill="#3b82f6"
              name="Attendance %"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentAnalytics.map((department, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{department.departmentName}</h3>
              </div>
              {getTrendIcon(department.insight)}
            </div>

            <div className="space-y-4">
              {/* Attendance Percentage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className={`text-lg font-bold ${getAttendanceColor(department.averageAttendance)}`}>
                  {department.averageAttendance.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    department.averageAttendance >= 75 ? 'bg-green-500' :
                    department.averageAttendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(department.averageAttendance, 100)}%` }}
                ></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="text-sm font-medium text-gray-900">{department.totalStudents}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Subjects</p>
                    <p className="text-sm font-medium text-gray-900">{department.totalClasses}</p>
                  </div>
                </div>
              </div>

              {/* Insight */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed">{department.insight || 'Performance data available'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {departmentAnalytics.filter(d => d.averageAttendance >= 75).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Departments with Good Attendance (≥75%)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {departmentAnalytics.filter(d => d.averageAttendance >= 60 && d.averageAttendance < 75).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Departments Needing Attention (60-74%)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {departmentAnalytics.filter(d => d.averageAttendance < 60).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Departments with Poor Attendance (&lt;60%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
