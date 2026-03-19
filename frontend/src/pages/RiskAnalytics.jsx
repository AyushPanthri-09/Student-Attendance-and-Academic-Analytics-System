import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { AlertTriangle, Users, TrendingDown, BookOpen, Search, Filter } from 'lucide-react';
import { onAnalyticsDataChanged } from '../utils/analyticsSync';

export default function RiskAnalytics() {
  const [riskAnalytics, setRiskAnalytics] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // all, safe, warning, critical
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    // Re-fetch whenever page, search term or risk filter changes
    fetchRiskData();
  }, [currentPage, searchTerm, riskFilter]);

  useEffect(() => {
    const unsubscribe = onAnalyticsDataChanged(() => {
      setCurrentPage(1);
      fetchRiskData();
    });
    return unsubscribe;
  }, [searchTerm, riskFilter]);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const riskParam = riskFilter === 'all' ? null : riskFilter;
      const data = await Promise.race([
        analyticsService.getRiskAnalysis(currentPage - 1, pageSize, searchTerm || null, riskParam || null),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Risk data request timed out')), 12000))
      ]);
      setRiskAnalytics(data.content || []);
      setTotalItems(data.totalElements || 0);
      // server returns paged items; use them directly
      setFilteredData(data.content || []);
    } catch (error) {
      console.error('Error fetching risk data:', error);
      setErrorMessage('Risk data load nahi hua. Please retry.');
      setRiskAnalytics([]);
      setFilteredData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };
  // Note: server performs filtering; filteredData is populated from server response

  const getRiskColor = (category) => {
    switch (category) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (category) => {
    switch (category) {
      case 'LOW': return <Users className="h-4 w-4" />;
      case 'MEDIUM': return <AlertTriangle className="h-4 w-4" />;
      case 'HIGH': return <TrendingDown className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
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

  const riskStats = {
    total: totalItems,
    safe: riskAnalytics.filter(s => s.riskLevel === 'LOW').length,
    warning: riskAnalytics.filter(s => s.riskLevel === 'MEDIUM').length,
    critical: riskAnalytics.filter(s => s.riskLevel === 'HIGH').length
  };

  const riskPercentage = riskStats.total > 0 ? {
    safe: (riskStats.safe / riskStats.total * 100).toFixed(1),
    warning: (riskStats.warning / riskStats.total * 100).toFixed(1),
    critical: (riskStats.critical / riskStats.total * 100).toFixed(1)
  } : { safe: 0, warning: 0, critical: 0 };

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedData = filteredData; // filteredData already represents current page items from server

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Risk Analysis</h1>
        <p className="text-gray-600 mt-2">Identify students at risk of poor attendance</p>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{riskStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Safe (≥75%)</p>
              <p className="text-2xl font-bold text-green-600">{riskStats.safe}</p>
              <p className="text-xs text-gray-500">{riskPercentage.safe}%</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning (60-74%)</p>
              <p className="text-2xl font-bold text-yellow-600">{riskStats.warning}</p>
              <p className="text-xs text-gray-500">{riskPercentage.warning}%</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical (&lt;60%)</p>
              <p className="text-2xl font-bold text-red-600">{riskStats.critical}</p>
              <p className="text-xs text-gray-500">{riskPercentage.critical}%</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, roll no, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              <option value="LOW">Safe Only</option>
              <option value="MEDIUM">Warning Only</option>
              <option value="HIGH">Critical Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Risk Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Students at Risk</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {paginatedData.length} of {totalItems} students (Page {currentPage} of {totalPages})
          </p>
          {errorMessage && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">{errorMessage}</p>
              <button
                onClick={fetchRiskData}
                className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problematic Subjects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insight
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                      <div className="text-sm text-gray-500">{student.rollNo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.departmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getAttendanceColor(student.attendancePercentage)}`}>
                      {student.attendancePercentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(student.riskLevel)}`}>
                      {getRiskIcon(student.riskLevel)}
                      <span className="ml-1">{student.riskLevel}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.problematicSubjects.slice(0, 2).map((subject, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {subject}
                        </span>
                      ))}
                      {student.problematicSubjects.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{student.problematicSubjects.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <p className="truncate" title={student.insight}>
                      {student.insight}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found matching the current filters</p>
          </div>
        )}

        {totalItems > pageSize && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Risk Distribution Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Safe Students (≥75% attendance)</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {riskStats.safe} students ({riskPercentage.safe}%)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Warning Zone (60-74% attendance)</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {riskStats.warning} students ({riskPercentage.warning}%)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Critical Risk (&lt;60% attendance)</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {riskStats.critical} students ({riskPercentage.critical}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
