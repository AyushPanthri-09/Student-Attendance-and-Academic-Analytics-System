import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, Hash, BookMarked, X } from "lucide-react";
import toast from "react-hot-toast";
import analyticsService from "../services/analyticsService";
import { emitAnalyticsDataChanged } from "../utils/analyticsSync";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [semester, setSemester] = useState(1);
  const [departmentId, setDepartmentId] = useState("");
  const [adding, setAdding] = useState(false);

  const API = "http://localhost:8080/api/subjects";

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(API);
      setSubjects(res.data);
    } catch (err) {
      toast.error("Failed to sync subject database");
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
    fetchSubjects();
    fetchDepartments();
  }, []);

  const addSubject = async () => {
    if (!name || !code || !departmentId) {
      toast.error("Name, code and department are mandatory");
      return;
    }
    try {
      setAdding(true);
      await axios.post(API, {
        name,
        code,
        semester,
        department: { id: Number(departmentId) }
      });
      analyticsService.clearCache();
      emitAnalyticsDataChanged('subjects-create');
      setName("");
      setCode("");
      setSemester(1);
      setDepartmentId("");
      toast.success("New module registered");
      fetchSubjects();
    } catch (err) {
      toast.error("Failed to commit record");
    } finally {
      setAdding(false);
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Permanent deletion of this module?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      analyticsService.clearCache();
      emitAnalyticsDataChanged('subjects-delete');
      toast.success("Module purged successfully");
      fetchSubjects();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Curriculum Registry</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Academic Module Management</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="glass flex items-center px-4 py-2 w-64 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
            <BookMarked size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
            <input
              type="text"
              placeholder="Name (e.g. DBMS)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full placeholder:text-gray-400"
            />
          </div>

          <div className="glass flex items-center px-4 py-2 w-48 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
            <Hash size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors"/>
            <input
              type="text"
              placeholder="Code (e.g. CS101)..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full placeholder:text-gray-400"
            />
          </div>

          <div className="glass flex items-center px-4 py-2 w-40 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
            <select
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value))}
              className="bg-transparent border-none outline-none pl-3 text-sm font-bold text-gray-700 w-full cursor-pointer"
            >
              {[1,2,3,4,5,6,7,8].map(s => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>
          </div>

          <div className="glass flex items-center px-4 py-2 w-56 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all rounded-2xl">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 w-full cursor-pointer"
            >
              <option value="">Department</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={addSubject}
            disabled={adding}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {adding ? <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <Plus size={16}/>}
            Register Module
          </button>
        </div>
      </div>

      {/* SUBJECTS LIST */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] overflow-hidden max-w-4xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24">ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Academic Module</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-3xl mb-4">
                        <BookOpen size={40} className="text-gray-300"/>
                      </div>
                      <h2 className="text-lg font-black text-gray-300 uppercase tracking-widest">No Modules Found</h2>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {subjects.map((s, idx) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Hash size={12} className="text-gray-300" />
                          <span className="text-xs font-black text-gray-400">{s.id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {s.name.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800 tracking-tight">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-semibold text-gray-700">{s.departmentName || "Unassigned"}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => deleteSubject(s.id)}
                            className="p-3 bg-white text-rose-500 rounded-xl shadow-sm border border-gray-100 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Purge Record"
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
    </div>
  );
}