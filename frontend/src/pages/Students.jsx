import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Users, Eye, ArrowRight, UserPlus, X } from "lucide-react";
import analyticsService from "../services/analyticsService";
import { emitAnalyticsDataChanged } from "../utils/analyticsSync";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  const [newStudent, setNewStudent] = useState({
    rollNo: "",
    name: "",
    semester: 1,
    departmentId: ""
  });

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/students");
      setStudents(res.data);
    } catch {
      toast.error("Failed to load students");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/departments");
      setDepartments(res.data);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
  }, []);

  const handleSaveStudent = async () => {
    if (!newStudent.rollNo || !newStudent.name || !newStudent.departmentId) {
      toast.error("Roll No, name and department are required");
      return;
    }
    try {
      setSaving(true);
      if (editMode) {
        await axios.put(`http://localhost:8080/api/students/${currentStudentId}`, {
          ...newStudent,
          departmentId: Number(newStudent.departmentId)
        });
        analyticsService.clearCache();
        emitAnalyticsDataChanged('students-update');
        toast.success("Student records updated");
      } else {
        await axios.post("http://localhost:8080/api/students", {
          ...newStudent,
          departmentId: Number(newStudent.departmentId)
        }, {
          headers: { "Content-Type": "application/json" }
        });
        analyticsService.clearCache();
        emitAnalyticsDataChanged('students-create');
        toast.success("New student added to database");
      }
      resetForm();
      fetchStudents();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleViewAttendance = (studentId) => {
    navigate(`/student-attendance/${studentId}`);
  };

  const handleEdit = (student) => {
    setNewStudent({ 
      rollNo: student.rollNo, 
      name: student.name,
      semester: student.semester || 1,
      departmentId: student.department?.id || ""
    });
    setCurrentStudentId(student.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this record?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/students/${id}`);
      analyticsService.clearCache();
      emitAnalyticsDataChanged('students-delete');
      toast.success("Record purged successfully");
      fetchStudents();
    } catch {
      toast.error("Deletion failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setNewStudent({ rollNo: "", name: "", semester: 1, departmentId: "" });
    setCurrentStudentId(null);
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Full Enrollment Management</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass flex items-center px-4 py-2 w-72 group focus-within:ring-2 focus-within:ring-blue-500 transition-all rounded-2xl">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors"/>
            <input
              type="text"
              placeholder="Filter by name or roll..."
              value={searchTerm}
              onChange={(e)=>setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={()=>setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <UserPlus size={16}/>
            Register Student
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Credentials</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <Users size={40} className="text-gray-300"/>
                      </div>
                      <h2 className="text-lg font-black text-gray-400 uppercase tracking-widest">No matching records found</h2>
                      <p className="text-xs text-gray-400 mt-2 font-medium italic">Try adjusting your search parameters.</p>
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
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">#{student.id}</span>
                      </td>
                      <td className="px-8 py-5 font-black text-blue-600 text-sm tracking-tight">{student.rollNo}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-[10px] font-black">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-gray-700 font-semibold">
                          {student.department?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={()=>handleViewAttendance(student.id)}
                            className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-gray-100 hover:bg-blue-600 hover:text-white transition-all"
                            title="Analytics Dashboard"
                          >
                            <Eye size={16}/>
                          </button>
                          <button
                            onClick={()=>handleEdit(student)}
                            className="p-2 bg-white text-amber-600 rounded-xl shadow-sm border border-gray-100 hover:bg-amber-600 hover:text-white transition-all"
                            title="Edit Record"
                          >
                            <Pencil size={16}/>
                          </button>
                          <button
                            onClick={()=>handleDelete(student.id)}
                            className="p-2 bg-white text-rose-600 rounded-xl shadow-sm border border-gray-100 hover:bg-rose-600 hover:text-white transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={16}/>
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

      {/* MODAL Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl shadow-black/20"
            >
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-white relative">
                <button onClick={resetForm} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
                  <X size={20}/>
                </button>
                <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                  <UserPlus size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight uppercase">
                  {editMode ? "Modify Record" : "New Enrollment"}
                </h2>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-[0.2em] mt-1 opacity-70">Security Protocol Alpha-9</p>
              </div>

              <div className="p-10 space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Institutional Identification (Roll No)</label>
                  <input
                    placeholder="e.g. CS2024001"
                    value={newStudent.rollNo}
                    onChange={(e)=>setNewStudent({...newStudent,rollNo:e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 placeholder:text-gray-300 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Legal Full Name</label>
                  <input
                    placeholder="Enter student's full name"
                    value={newStudent.name}
                    onChange={(e)=>setNewStudent({...newStudent,name:e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 placeholder:text-gray-300 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Academic Semester</label>
                  <select
                    value={newStudent.semester}
                    onChange={(e)=>setNewStudent({...newStudent,semester:parseInt(e.target.value)})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 transition-all"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Department</label>
                  <select
                    value={newStudent.departmentId}
                    onChange={(e)=>setNewStudent({...newStudent,departmentId:e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 transition-all"
                  >
                    <option value="">Select department</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={resetForm}
                    className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Abort
                  </button>

                  <button
                    onClick={handleSaveStudent}
                    disabled={saving}
                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <Plus size={14}/>}
                    {editMode ? "Commit Changes" : "Finalize Registration"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}