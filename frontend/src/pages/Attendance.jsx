import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Save, Calendar, BookOpen, Users, Hash, ShieldCheck, GitBranch, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { useButtonClick } from "../hooks/useButtonClick";
import analyticsService from "../services/analyticsService";
import { emitAnalyticsDataChanged } from "../utils/analyticsSync";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0 });
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (subjectId) {
      fetchStudentsBySubject(subjectId);
    } else {
      fetchAllStudents();
    }
    setAttendance({});
    setStats({ present: 0, absent: 0 });
  }, [subjectId]);

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get("/api/students");
      setStudents(res.data);
    } catch (err) {
      toast.error("Cloud sync failed for student registry");
    }
  };

  const fetchStudentsBySubject = async (subjectId) => {
    try {
      const res = await axios.get(`/api/attendance/subject/${subjectId}/students`);
      setStudents(res.data);
    } catch (err) {
      fetchAllStudents();
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("/api/subjects");
      setSubjects(res.data);
    } catch (err) {
      toast.error("Module synchronization failed");
    }
  };

  const handleStatusChange = (studentId, status) => {
    const updated = { ...attendance, [studentId]: status };
    setAttendance(updated);
    
    let present = 0;
    let absent = 0;
    Object.values(updated).forEach(s => {
      if (s === "PRESENT") present++;
      if (s === "ABSENT") absent++;
    });
    setStats({ present, absent });
  };

  const getDepartmentLabel = (student) => student?.departmentName || student?.department?.name || 'Unknown Department';
  const getBranchLabel = (student) => student?.branchName || student?.branch?.name || student?.section || 'General';

  const departmentOptions = Array.from(new Set(students.map(getDepartmentLabel))).filter(Boolean);
  const branchOptions = Array.from(new Set(students.map(getBranchLabel))).filter(Boolean);

  const filteredStudents = students.filter((student) => {
    const matchesDepartment = selectedDepartment === 'ALL' || getDepartmentLabel(student) === selectedDepartment;
    const matchesBranch = selectedBranch === 'ALL' || getBranchLabel(student) === selectedBranch;
    return matchesDepartment && matchesBranch;
  });

  const submitAttendanceAsync = async () => {
    if (!subjectId) {
      toast.error("Authentication Error: Select Academic Module");
      return;
    }
    if (!date) {
      toast.error("Validation Error: Temporal Reference Required");
      return;
    }
    if (Object.keys(attendance).length < students.length) {
      if (!window.confirm("Partial entry detected. Proceed with incomplete record?")) return;
    }

    setLoading(true);
    try {
      const attendanceData = Object.keys(attendance).map((studentId) => ({
        studentId,
        subjectId,
        date,
        status: attendance[studentId]
      }));

      await axios.post("/api/attendance/bulk", attendanceData);
      analyticsService.clearCache();
      emitAnalyticsDataChanged('attendance');
      toast.success("Data committed to secure ledger");
      setAttendance({});
      setDate("");
      setStats({ present: 0, absent: 0 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Encryption/Committal Error");
    } finally {
      setLoading(false);
    }
  };

  // Debounced submit handler - prevents rapid clicks
  const debouncedSubmit = useButtonClick(submitAttendanceAsync, 500);

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Attendance Protocol</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">High-Fidelity Interaction Ledger</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass p-6 rounded-[2rem] flex items-center gap-6">
            <div className="text-center px-4 border-r border-gray-100">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Present</p>
              <p className="text-xl font-black text-gray-900">{stats.present}</p>
            </div>
            <div className="text-center px-4 border-r border-gray-100">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Absent</p>
              <p className="text-xl font-black text-gray-900">{stats.absent}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-xl font-black text-gray-900">{Math.max(filteredStudents.length - (stats.present + stats.absent), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="glass flex items-center px-4 py-2 w-full md:w-80 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
          <BookOpen size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full appearance-none cursor-pointer"
          >
            <option value="">Select Academic Module</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div className="glass flex items-center px-4 py-2 w-full md:w-64 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
          <Calendar size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full cursor-pointer"
          />
        </div>

        <div className="glass flex items-center px-4 py-2 w-full md:w-72 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
          <Building2 size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedBranch('ALL');
            }}
            className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full appearance-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departmentOptions.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>

        <div className="glass flex items-center px-4 py-2 w-full md:w-72 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
          <GitBranch size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full appearance-none cursor-pointer"
          >
            <option value="ALL">All Branches</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        <button
          onClick={debouncedSubmit}
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <ShieldCheck size={16}/>}
          Commit Attendance
        </button>
      </div>

      {/* ATTENDANCE TABLE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Roll Identifier</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status Toggle</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-3xl mb-4">
                        <Users size={40} className="text-gray-300"/>
                      </div>
                      <h2 className="text-lg font-black text-gray-300 uppercase tracking-widest">No Active Records</h2>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredStudents.map((student, idx) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Hash size={12} className="text-blue-400 opacity-50" />
                          <span className="font-black text-gray-600 text-sm">{student.rollNo}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 text-gray-400 flex items-center justify-center font-black group-hover:from-indigo-500 group-hover:to-blue-600 group-hover:text-white transition-all">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 tracking-tight block">{student.name}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{getDepartmentLabel(student)} • {getBranchLabel(student)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleStatusChange(student.id, "PRESENT")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                              attendance[student.id] === "PRESENT"
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-white text-gray-400 border border-gray-100 hover:bg-emerald-50 hover:text-emerald-500 group-hover:scale-105"
                            }`}
                          >
                            <CheckCircle size={14}/>
                            Secure
                          </button>

                          <button
                            onClick={() => handleStatusChange(student.id, "ABSENT")}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                              attendance[student.id] === "ABSENT"
                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                : "bg-white text-gray-400 border border-gray-100 hover:bg-rose-50 hover:text-rose-500 group-hover:scale-105"
                            }`}
                          >
                            <XCircle size={14}/>
                            Absent
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* BOTTOM ACTION */}
      <div className="flex justify-end p-4">
        <button
          onClick={debouncedSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600/10 text-indigo-600 px-10 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? <span className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Save size={16}/>}
          Commit Partial Record
        </button>
      </div>
    </div>
  );
}