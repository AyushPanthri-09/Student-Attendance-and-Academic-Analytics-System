import { useEffect, useState } from "react";
import axios from "axios";
import AttendancePredictor from "../components/AttendancePredictor";

const API = "http://localhost:8080/api";

export default function EligibilityReport() {

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [semesterTotal, setSemesterTotal] = useState("60");
  const [threshold, setThreshold] = useState(75);
  const [semester, setSemester] = useState(3);
  const [report, setReport] = useState([]);
  const [perSubjectMode, setPerSubjectMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [safeStudents, setSafeStudents] = useState(0);
  const [notEligibleStudents, setNotEligibleStudents] = useState(0);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const res = await axios.get(`${API}/departments`);
    setDepartments(res.data);
  };

  const generateReport = async () => {
    if (!selectedDept || !semesterTotal) {
      alert("Select department and enter total classes in semester (across all subjects) or enable 'classes per subject' mode");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/attendance/report/department/${selectedDept}/${semesterTotal}`,
        { params: { semester, threshold, perSubject: perSubjectMode } }
      );

      setReport(res.data);

      let safe = 0;
      let not = 0;

      res.data.forEach((s) => {
        if (s.status === "ELIGIBLE") safe++;
        else not++;
      });

      setSafeStudents(safe);
      setNotEligibleStudents(not);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!selectedDept || !semesterTotal) {
      alert("Generate report first");
      return;
    }

    try {
      const res = await axios.get(
        `${API}/attendance/report/pdf/${selectedDept}/${semesterTotal}/${semester}`,
        { params: { threshold, perSubject: perSubjectMode }, responseType: "blob" }
      );

      // Create blob and download link
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create download link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to download PDF");
    }
  };

  const getStatusColor = (status) => {
    if (status === "ELIGIBLE") return "text-green-600 font-bold";
    return "text-red-600 font-bold";
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= threshold) return "text-green-600 font-semibold";
    if (percentage >= threshold - 10) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const getSelectedDepartmentName = () => {
    const dept = departments.find(d => d.id === parseInt(selectedDept));
    return dept ? dept.name : "Unknown Department";
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Attendance Eligibility Report
      </h1>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Classes</label>
            <input
              type="number"
              placeholder="Total classes"
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={semesterTotal}
              onChange={(e) => setSemesterTotal(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Threshold (%)</label>
            <input
              type="number"
              placeholder="Threshold"
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <input
              type="number"
              placeholder="Semester"
              className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              min="1"
              max="8"
            />
          </div>

          <div className="flex items-end">
            <div className="flex items-center gap-2">
              <input
                id="perSubject"
                type="checkbox"
                checked={perSubjectMode}
                onChange={(e) => setPerSubjectMode(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="perSubject" className="text-sm text-gray-700">Per Subject</label>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={downloadPDF}
              disabled={report.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>• Total Classes: Number of class sessions in the semester</p>
          <p>• Per Subject: If checked, the number is treated as classes PER SUBJECT</p>
          <p>• Threshold: Minimum attendance percentage required for eligibility</p>
        </div>
      </div>

      {/* Summary Cards */}
      {report.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-bold text-blue-700">Total Students</h2>
            <p className="text-3xl font-bold text-blue-800">{report.length}</p>
            <p className="text-sm text-blue-600">{getSelectedDepartmentName()}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-bold text-green-700">Eligible</h2>
            <p className="text-3xl font-bold text-green-800">{safeStudents}</p>
            <p className="text-sm text-green-600">
              {((safeStudents / report.length) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-red-100 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-bold text-red-700">Not Eligible</h2>
            <p className="text-3xl font-bold text-red-800">{notEligibleStudents}</p>
            <p className="text-sm text-red-600">
              {((notEligibleStudents / report.length) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="bg-purple-100 p-6 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-bold text-purple-700">Threshold</h2>
            <p className="text-3xl font-bold text-purple-800">{threshold}%</p>
            <p className="text-sm text-purple-600">Required</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Roll No</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Course</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700">Department</th>
              <th className="p-3 text-center text-sm font-medium text-gray-700">Attendance %</th>
              <th className="p-3 text-center text-sm font-medium text-gray-700">Required</th>
              <th className="p-3 text-center text-sm font-medium text-gray-700">Remaining</th>
              <th className="p-3 text-center text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {report.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-8 text-gray-500">
                  {loading ? "Generating report..." : "Generate report to see data"}
                </td>
              </tr>
            ) : (
              report.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 text-sm">{s.rollNo}</td>
                  <td className="p-3 text-sm font-medium">{s.name}</td>
                  <td className="p-3 text-sm">{s.course}</td>
                  <td className="p-3 text-sm">{s.department}</td>
                  <td className={`p-3 text-sm text-center ${getAttendanceColor(s.attendancePercentage)}`}>
                    {s.attendancePercentage.toFixed(2)}%
                  </td>
                  <td className="p-3 text-sm text-center">{s.requiredClasses}</td>
                  <td className="p-3 text-sm text-center">{s.remainingClasses}</td>
                  <td className={`p-3 text-sm text-center ${getStatusColor(s.status)}`}>
                    {s.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}