import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, BarChart3, Filter, Calendar } from "lucide-react";

export default function StudentAttendance() {
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");

  // Summary stats
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, dateRange, department, branch]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Fetch student details
      const studentRes = await axios.get(`http://localhost:8080/api/students/${studentId}`);
      setStudent(studentRes.data);

      // Fetch attendance records
      const attendanceRes = await axios.get(`http://localhost:8080/api/attendance/student/${studentId}`);
      setAttendanceRecords(attendanceRes.data);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(record =>
        record.date >= dateRange.start
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(record =>
        record.date <= dateRange.end
      );
    }

    // Department and branch filters
    if (department) {
      filtered = filtered.filter((record) => {
        const deptName = record.subject?.department?.name || record.subject?.departmentName || "";
        return deptName === department;
      });
    }

    if (branch) {
      filtered = filtered.filter((record) => {
        const branchName = record.subject?.branch?.name || record.subject?.branchName || record.subject?.section || "";
        return branchName === branch;
      });
    }

    setFilteredRecords(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (records) => {
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const total = records.length;

    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    setStats({
      present,
      absent,
      late,
      attendanceRate
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'ABSENT':
        return <XCircle className="text-red-500" size={16} />;
      case 'LATE':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'Present';
      case 'ABSENT':
        return 'Absent';
      case 'LATE':
        return 'Late';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const departmentOptions = Array.from(
    new Set(
      attendanceRecords
        .map((record) => record.subject?.department?.name || record.subject?.departmentName)
        .filter(Boolean)
    )
  );

  const branchOptions = Array.from(
    new Set(
      attendanceRecords
        .map((record) => record.subject?.branch?.name || record.subject?.branchName || record.subject?.section)
        .filter(Boolean)
    )
  );

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Student Attendance Record
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {student ? `${student.name} (${student.rollNo})` : 'Loading...'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="text-gray-500" size={20} />
          <span className="font-semibold text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Branches</option>
              {branchOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              setDateRange({ start: "", end: "" });
              setDepartment("");
              setBranch("");
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <XCircle className="text-red-500" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
            </div>
            <BarChart3 className="text-blue-500" size={32} />
          </div>
        </motion.div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Attendance History</h2>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No Records Found</h3>
            <p className="text-gray-500">No attendance records match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-sm font-medium text-gray-700">Name</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Date</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Subject</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="p-4 text-sm font-medium text-gray-700">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((record, index) => (
                  <motion.tr
                    key={record.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-900">
                      {student?.name}
                    </td>
                    <td className="p-4 text-gray-700">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-700">
                      {record.subject?.name || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`font-medium ${
                          record.status === 'PRESENT' ? 'text-green-600' :
                          record.status === 'ABSENT' ? 'text-red-600' :
                          record.status === 'LATE' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      {record.remarks || '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}