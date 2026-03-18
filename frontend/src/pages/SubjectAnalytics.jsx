import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, TrendingDown, TrendingUp, AlertCircle, Users, Calendar } from 'lucide-react';

export default function SubjectAnalytics() {
  const [subjectAnalytics, setSubjectAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('attendance'); // attendance, name, department

  useEffect(() => {
    fetchSubjectData();
  }, []);

  const fetchSubjectData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getSubjectAnalytics();
      setSubjectAnalytics(data);
    } catch (error) {
      console.error('Error fetching subject data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedSubjects = () => {
    const sorted = [...subjectAnalytics];
    switch (sortBy) {
      case 'attendance':
        return sorted.sort((a, b) => b.averageAttendance - a.averageAttendance);
      case 'name':
        return sorted.sort((a, b) => a.subjectName.localeCompare(b.subjectName));
      case 'department':
        return sorted.sort((a, b) => a.departmentName.localeCompare(b.departmentName));
      default:
        return sorted;
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBgColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInsightIcon = (insight) => {
    if (!insight) return <AlertCircle className="h-4 w-4 text-gray-500" />;
    if (insight.toLowerCase().includes('lower') || insight.toLowerCase().includes('poor')) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else if (insight.toLowerCase().includes('higher') || insight.toLowerCase().includes('good')) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sortedSubjects = getSortedSubjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subject Analytics</h1>
        <p className="text-gray-600 mt-2">Attendance performance analysis by subject</p>
      </div>

      {/* Sorting Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { value: 'attendance', label: 'Attendance %' },
              { value: 'name', label: 'Subject Name' },
              { value: 'department', label: 'Department' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Attendance Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedSubjects.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="subjectName" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              interval={0}
            />
            <YAxis 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(1)}%`, 'Attendance']}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900">{data.subjectName}</p>
                      <p className="text-sm text-gray-600">Department: {data.departmentName}</p>
                      <p className="text-sm text-gray-600">Semester: {data.semester}</p>
                      <p className="text-sm font-medium text-blue-600">
                        Attendance: {data.attendancePercentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="attendancePercentage" 
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSubjects.map((subject, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{subject.subjectName}</h3>
                  <p className="text-xs text-gray-500">{subject.subjectCode}</p>
                </div>
              </div>
              {getInsightIcon(subject.insight)}
            </div>

            <div className="space-y-4">
              {/* Attendance Percentage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className={`text-lg font-bold ${getAttendanceColor(subject.averageAttendance)}`}>
                  {subject.averageAttendance.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getAttendanceBgColor(subject.averageAttendance)}`}
                  style={{ width: `${Math.min(subject.averageAttendance, 100)}%` }}
                ></div>
              </div>

              {/* Subject Details */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">{subject.departmentName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Semester</span>
                  <span className="font-medium text-gray-900">{subject.semester}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Classes</span>
                  <span className="font-medium text-gray-900">{subject.presentCount}/{subject.totalClasses}</span>
                </div>
              </div>

              {/* Insight */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 leading-relaxed">{subject.insight}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {subjectAnalytics.filter(s => s.attendancePercentage >= 75).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Good Attendance (≥75%)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {subjectAnalytics.filter(s => s.attendancePercentage >= 60 && s.attendancePercentage < 75).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Needs Attention (60-74%)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {subjectAnalytics.filter(s => s.attendancePercentage < 60).length}
            </div>
            <p className="text-sm text-gray-600 mt-1">Poor Attendance (&lt;60%)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {subjectAnalytics.length > 0 
                ? (subjectAnalytics.reduce((sum, s) => sum + s.attendancePercentage, 0) / subjectAnalytics.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Average Attendance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
