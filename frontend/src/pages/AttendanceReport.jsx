import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Download, Filter, Users, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import AttendancePredictor from "../components/AttendancePredictor";

export default function AttendanceReport() {

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const [filters, setFilters] = useState({
    departmentId: "",
    courseId: "",
    semester: "",
    semesterTotal: 60 // Default
  });

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    safe: 0,
    canCover: 0,
    cannotCover: 0
  });

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceData = async () => {
    if (!filters.departmentId) {
      alert("Select Department");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/attendance/report/attendance/${filters.departmentId}/${filters.semesterTotal}`);
      setAttendanceData(res.data);

      // Calculate summary
      const safe = res.data.filter(s => s.predictiveStatus === 'SAFE').length;
      const canCover = res.data.filter(s => s.predictiveStatus === 'CAN COVER').length;
      const cannotCover = res.data.filter(s => s.predictiveStatus === 'CANNOT COVER').length;
      setSummary({ safe, canCover, cannotCover });
    } catch (err) {
      console.error(err);
      alert("Error fetching attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const downloadAttendanceAnalysisReport = async () => {
    if (!filters.departmentId) {
      alert("Select Department for report");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/attendance/report/attendance/pdf/${filters.departmentId}/${filters.semesterTotal}/${filters.semester || 1}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Attendance_Analysis_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Error downloading report");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SAFE': return 'bg-green-100 text-green-800';
      case 'CAN COVER': return 'bg-yellow-100 text-yellow-800';
      case 'CANNOT COVER': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Attendance Report & Predictor
      </h1>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={filters.departmentId}
          onChange={(e) => handleFilterChange("departmentId", e.target.value)}
          className="border p-3 rounded-xl"
        >
          <option value="">Select Department</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Semester Total Classes"
          value={filters.semesterTotal}
          onChange={(e) => handleFilterChange("semesterTotal", e.target.value)}
          className="border p-3 rounded-xl"
        />

        <button
          onClick={fetchAttendanceData}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          <Filter size={18} />
          Load Report
        </button>

        <button
          onClick={downloadAttendanceAnalysisReport}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700"
        >
          <Download size={18} />
          Download Attendance Analysis PDF
        </button>
      </div>

      {/* SUMMARY CARDS */}
      {attendanceData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={32} />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Safe</h3>
                <p className="text-2xl font-bold text-green-600">{summary.safe}</p>
                <p className="text-sm text-green-700">Already Eligible</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600" size={32} />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Can Cover</h3>
                <p className="text-2xl font-bold text-yellow-600">{summary.canCover}</p>
                <p className="text-sm text-yellow-700">Can Reach Eligibility</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600" size={32} />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Cannot Cover</h3>
                <p className="text-2xl font-bold text-red-600">{summary.cannotCover}</p>
                <p className="text-sm text-red-700">Will Not Reach Eligibility</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI PREDICTOR */}
      <div className="mb-8">
        <AttendancePredictor />
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance data...</p>
        </div>
      )}

      {/* ATTENDANCE DATA TABLE */}
      {!loading && attendanceData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto"
        >
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b text-left bg-gray-50">
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Course</th>
                <th className="p-3">Attendance %</th>
                <th className="p-3">Present Classes</th>
                <th className="p-3">Total Classes</th>
                <th className="p-3">Classes Missed</th>
                <th className="p-3">Remaining Classes</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.rollNo}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.department}</td>
                  <td className="p-3">{item.course}</td>
                  <td className="p-3">{item.attendancePercentage.toFixed(2)}%</td>
                  <td className="p-3">{item.presentClasses}</td>
                  <td className="p-3">{item.totalClasses}</td>
                  <td className="p-3">{item.classesMissed}</td>
                  <td className="p-3">{item.remainingClasses}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.predictiveStatus)}`}>
                      {item.predictiveStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {!loading && attendanceData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No attendance data found. Load report to view data.</p>
        </div>
      )}
    </div>
  );
}